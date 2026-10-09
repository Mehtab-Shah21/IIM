<?php
/**
 * REST endpoints:
 *   POST /wp-json/iim/v1/lead        Quote and annual-contract submissions (JSON for fetch, 303 redirect without JS).
 *   GET  /wp-json/iim/v1/form-token  Fresh nonce + timing token for cached pages.
 *
 * Both must be excluded from page caching (LiteSpeed and Cloudflare); see docs/runbook.md.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'iim/v1',
			'/lead',
			array(
				'methods'             => 'POST',
				'callback'            => 'iim_core_rest_lead',
				'permission_callback' => '__return_true', // Public form; protected by the checks in form-security.php.
			)
		);
		register_rest_route(
			'iim/v1',
			'/form-token',
			array(
				'methods'             => 'GET',
				'callback'            => function () {
					$res = new WP_REST_Response(
						array(
							'nonce' => wp_create_nonce( 'iim_lead' ),
							'token' => iim_core_form_token(),
						)
					);
					$res->header( 'Cache-Control', 'no-store, max-age=0' );
					return $res;
				},
				'permission_callback' => '__return_true',
			)
		);
	}
);

/**
 * Whether the client wants JSON (fetch) rather than a redirect (plain HTML form post).
 *
 * @param WP_REST_Request $request Request.
 */
function iim_core_wants_json( WP_REST_Request $request ) {
	return false !== strpos( (string) $request->get_header( 'accept' ), 'application/json' );
}

/**
 * Build the response for success or failure in the right shape.
 *
 * @param WP_REST_Request $request Request.
 * @param bool            $ok      Success.
 * @param array           $data    ref|redirect on success; errors|message|status on failure.
 */
function iim_core_lead_response( WP_REST_Request $request, $ok, $data ) {
	$json = iim_core_wants_json( $request );

	if ( $ok ) {
		$redirect = add_query_arg( 'ref', rawurlencode( $data['ref'] ), home_url( '/thank-you/' ) );
		if ( $json ) {
			$res = new WP_REST_Response( array( 'ok' => true, 'ref' => $data['ref'], 'redirect' => $redirect ), 200 );
		} else {
			$res = new WP_REST_Response( null, 303 );
			$res->header( 'Location', $redirect );
		}
	} else {
		$status = $data['status'] ?? 422;
		if ( $json ) {
			$res = new WP_REST_Response(
				array(
					'ok'      => false,
					'message' => $data['message'] ?? '',
					'errors'  => (object) ( $data['errors'] ?? array() ),
				),
				$status
			);
		} else {
			$key  = iim_core_store_form_state( $data['type'] ?? 'quote', $data['values'] ?? array(), $data['errors'] ?? array(), $data['message'] ?? '' );
			$back = wp_validate_redirect( (string) $request->get_param( 'page_url' ), home_url( '/get-a-quote/' ) );
			$res  = new WP_REST_Response( null, 303 );
			$res->header( 'Location', add_query_arg( 'iim_form', $key, $back ) . '#' . ( 'amc' === ( $data['type'] ?? '' ) ? 'apply' : 'quote-form' ) );
		}
	}
	$res->header( 'Cache-Control', 'no-store, max-age=0' );
	return $res;
}

/**
 * Handle a submission. Order on success: save lead, webhook, owner email, customer email, redirect.
 *
 * @param WP_REST_Request $request Request.
 */
function iim_core_rest_lead( WP_REST_Request $request ) {
	$type   = 'amc' === $request->get_param( 'form_type' ) ? 'amc' : 'quote';
	$params = $request->get_body_params();

	// 1. Spam and abuse checks.
	$flags = iim_core_run_spam_checks( $request );
	if ( is_wp_error( $flags ) ) {
		if ( 'iim_honeypot' === $flags->get_error_code() ) {
			// Look successful to the bot, store nothing.
			return iim_core_lead_response( $request, true, array( 'ref' => 'IIM-000000-0000' ) );
		}
		$status = (int) ( $flags->get_error_data()['status'] ?? 403 );
		return iim_core_lead_response(
			$request,
			false,
			array(
				'type'    => $type,
				'status'  => $status,
				'message' => $flags->get_error_message(),
				'values'  => iim_core_validate_lead( $type, $params )[0],
			)
		);
	}

	// 2. Validation.
	list( $clean, $errors ) = iim_core_validate_lead( $type, $params );

	$files = 'quote' === $type ? iim_core_normalise_files( $request->get_file_params() ) : array();
	if ( $files ) {
		$file_check = iim_core_validate_files( $files );
		if ( true !== $file_check ) {
			$errors['photos'] = $file_check;
		}
	}

	if ( $errors ) {
		return iim_core_lead_response(
			$request,
			false,
			array(
				'type'    => $type,
				'status'  => 422,
				'message' => __( 'Please check the highlighted fields.', 'iim-core' ),
				'errors'  => $errors,
				'values'  => $clean,
			)
		);
	}

	// 3. Save first, so nothing is lost even if every delivery channel fails.
	$ref     = iim_core_new_reference();
	$stored  = iim_core_store_files( $files, $ref );
	$lead_id = iim_core_save_lead( $type, $clean, $stored, $flags, $ref, (string) $request->get_param( 'page_url' ) );
	if ( is_wp_error( $lead_id ) ) {
		return iim_core_lead_response(
			$request,
			false,
			array(
				'type'    => $type,
				'status'  => 500,
				'message' => __( 'We could not save your request. Please message us on WhatsApp.', 'iim-core' ),
				'values'  => $clean,
			)
		);
	}

	// 4. Webhook (Google Sheet + WhatsApp alert to the owner). Failures are retried by cron.
	iim_core_deliver_webhook( $lead_id );

	// 5–6. Emails.
	update_post_meta( $lead_id, '_iim_owner_mail', iim_core_mail_owner( $lead_id ) ? 'sent' : 'failed' );
	update_post_meta( $lead_id, '_iim_customer_mail', iim_core_mail_customer( $lead_id ) ? 'sent' : 'skipped' );

	// 7. Redirect to /thank-you/?ref=…
	return iim_core_lead_response( $request, true, array( 'ref' => $ref ) );
}
