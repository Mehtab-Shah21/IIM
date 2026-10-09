<?php
/**
 * Signed webhook delivery to Make or n8n (Google Sheet row + WhatsApp alert to the owner).
 *
 * Signature: header X-IIM-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" with IIM_WEBHOOK_SECRET>.
 * The receiver should recompute it and reject requests older than 5 minutes.
 *
 * Failures are retried with backoff (5 min, 15 min, 1 h, 6 h, 24 h) by a cron job; after the last
 * attempt the lead is marked "failed" and an admin notice and an email to the owner flag it.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

const IIM_CORE_WEBHOOK_BACKOFF = array( 300, 900, 3600, 21600, 86400 );

/**
 * Attempt delivery once.
 *
 * @param int $lead_id Lead.
 * @return bool Delivered.
 */
function iim_core_deliver_webhook( $lead_id ) {
	if ( ! defined( 'IIM_WEBHOOK_URL' ) || ! IIM_WEBHOOK_URL ) {
		update_post_meta( $lead_id, '_iim_webhook_status', 'disabled' );
		return false;
	}

	$body = wp_json_encode( array( 'event' => 'lead.created', 'lead' => iim_core_lead_payload( $lead_id ) ) );
	$ts   = time();
	$sig  = hash_hmac( 'sha256', $ts . '.' . $body, defined( 'IIM_WEBHOOK_SECRET' ) ? IIM_WEBHOOK_SECRET : '' );

	$res = wp_remote_post(
		IIM_WEBHOOK_URL,
		array(
			'timeout'  => 6,
			'blocking' => true,
			'headers'  => array(
				'Content-Type'    => 'application/json',
				'X-IIM-Signature' => 't=' . $ts . ',v1=' . $sig,
				'X-IIM-Reference' => get_post_meta( $lead_id, '_iim_ref', true ),
			),
			'body'     => $body,
		)
	);

	$attempts = (int) get_post_meta( $lead_id, '_iim_webhook_attempts', true ) + 1;
	update_post_meta( $lead_id, '_iim_webhook_attempts', $attempts );

	$code = is_wp_error( $res ) ? 0 : (int) wp_remote_retrieve_response_code( $res );
	if ( $code >= 200 && $code < 300 ) {
		update_post_meta( $lead_id, '_iim_webhook_status', 'sent' );
		update_post_meta( $lead_id, '_iim_webhook_sent_at', gmdate( 'c' ) );
		delete_post_meta( $lead_id, '_iim_webhook_next' );
		delete_post_meta( $lead_id, '_iim_webhook_last_error' );
		return true;
	}

	$error = is_wp_error( $res ) ? $res->get_error_message() : 'HTTP ' . $code;
	update_post_meta( $lead_id, '_iim_webhook_last_error', mb_substr( $error, 0, 300 ) );

	if ( $attempts > count( IIM_CORE_WEBHOOK_BACKOFF ) ) {
		update_post_meta( $lead_id, '_iim_webhook_status', 'failed' );
		delete_post_meta( $lead_id, '_iim_webhook_next' );
		iim_core_mail_webhook_failed( $lead_id, $error );
	} else {
		update_post_meta( $lead_id, '_iim_webhook_status', 'pending' );
		update_post_meta( $lead_id, '_iim_webhook_next', time() + IIM_CORE_WEBHOOK_BACKOFF[ $attempts - 1 ] );
	}
	return false;
}

/**
 * Cron: retry due deliveries.
 */
add_action(
	'iim_core_retry_webhooks',
	function () {
		$ids = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => 20,
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery
					'relation' => 'AND',
					array( 'key' => '_iim_webhook_status', 'value' => 'pending' ),
					array( 'key' => '_iim_webhook_next', 'value' => time(), 'compare' => '<=', 'type' => 'NUMERIC' ),
				),
			)
		);
		foreach ( $ids as $id ) {
			iim_core_deliver_webhook( $id );
		}
	}
);

/**
 * Admin notice listing undelivered leads.
 */
add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'edit_iim_leads' ) ) {
			return;
		}
		$failed = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => 50,
				'meta_query'     => array( array( 'key' => '_iim_webhook_status', 'value' => 'failed' ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
			)
		);
		if ( ! $failed ) {
			return;
		}
		printf(
			'<div class="notice notice-error"><p>%s <a href="%s">%s</a></p></div>',
			/* translators: %d: number of leads. */
			esc_html( sprintf( _n( '%d lead could not be sent to the Google Sheet / WhatsApp alert.', '%d leads could not be sent to the Google Sheet / WhatsApp alert.', count( $failed ), 'iim-core' ), count( $failed ) ) ),
			esc_url( admin_url( 'edit.php?post_type=lead&iim_status=failed' ) ),
			esc_html__( 'Review and retry', 'iim-core' )
		);
	}
);

/**
 * Manual retry from the lead list (row action) or the lead screen.
 */
add_action(
	'admin_post_iim_retry_webhook',
	function () {
		$lead_id = isset( $_GET['lead'] ) ? absint( $_GET['lead'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		check_admin_referer( 'iim_retry_' . $lead_id );
		if ( ! current_user_can( 'edit_post', $lead_id ) ) {
			wp_die( esc_html__( 'Not allowed.', 'iim-core' ), 403 );
		}
		update_post_meta( $lead_id, '_iim_webhook_attempts', 0 );
		$ok = iim_core_deliver_webhook( $lead_id );
		wp_safe_redirect( add_query_arg( 'iim_retried', $ok ? 'ok' : 'fail', wp_get_referer() ?: admin_url( 'edit.php?post_type=lead' ) ) );
		exit;
	}
);
