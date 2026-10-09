<?php
/**
 * Spam and abuse checks for the forms: nonce, signed timing token, honeypot, Cloudflare Turnstile,
 * rate limit (5 per hour per IP).
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

const IIM_CORE_MIN_FILL_SECONDS = 4;
const IIM_CORE_TOKEN_TTL        = DAY_IN_SECONDS;
const IIM_CORE_RATE_LIMIT       = 5;

/**
 * Signed "form rendered at" token: "<unix time>.<hmac>". Proves the form was loaded from this site
 * and lets us reject submissions sent faster than a person could type.
 */
function iim_core_form_token() {
	$ts = time();
	return $ts . '.' . hash_hmac( 'sha256', 'iim-form|' . $ts, wp_salt( 'nonce' ) );
}

/**
 * Validate the timing token.
 *
 * @param string $token Token.
 * @return true|WP_Error
 */
function iim_core_check_form_token( $token ) {
	$parts = explode( '.', (string) $token );
	if ( 2 !== count( $parts ) || ! ctype_digit( $parts[0] ) ) {
		return new WP_Error( 'iim_token', __( 'Your session expired. Please reload the page and try again.', 'iim-core' ) );
	}
	$expected = hash_hmac( 'sha256', 'iim-form|' . $parts[0], wp_salt( 'nonce' ) );
	if ( ! hash_equals( $expected, $parts[1] ) ) {
		return new WP_Error( 'iim_token', __( 'Your session expired. Please reload the page and try again.', 'iim-core' ) );
	}
	$age = time() - (int) $parts[0];
	if ( $age > IIM_CORE_TOKEN_TTL ) {
		return new WP_Error( 'iim_token', __( 'Your session expired. Please reload the page and try again.', 'iim-core' ) );
	}
	if ( $age < IIM_CORE_MIN_FILL_SECONDS ) {
		return new WP_Error( 'iim_too_fast', __( 'That was very fast. Please check your details and send again.', 'iim-core' ) );
	}
	return true;
}

/**
 * Visitor IP. Cloudflare's header is trusted only when IIM_TRUST_CF_IP is true (site behind Cloudflare
 * with origin locked to Cloudflare IPs), otherwise it could be spoofed.
 */
function iim_core_client_ip() {
	if ( defined( 'IIM_TRUST_CF_IP' ) && IIM_TRUST_CF_IP && ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
		$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
	} else {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	}
	return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}

/**
 * Rate limit: count submissions per IP in a rolling hour. The IP is stored only as a salted hash.
 *
 * @return true|WP_Error
 */
function iim_core_check_rate_limit() {
	$key   = 'iim_rl_' . substr( hash_hmac( 'sha256', iim_core_client_ip(), wp_salt( 'auth' ) ), 0, 32 );
	$count = (int) get_transient( $key );
	if ( $count >= IIM_CORE_RATE_LIMIT ) {
		return new WP_Error( 'iim_rate', __( 'Too many requests from your connection. Please message us on WhatsApp instead.', 'iim-core' ), array( 'status' => 429 ) );
	}
	set_transient( $key, $count + 1, HOUR_IN_SECONDS );
	return true;
}

/**
 * Cloudflare Turnstile verification.
 *
 * @param string $response Widget response token.
 * @return true|WP_Error
 */
function iim_core_verify_turnstile( $response ) {
	if ( ! defined( 'IIM_TURNSTILE_SECRET_KEY' ) || ! IIM_TURNSTILE_SECRET_KEY ) {
		return true; // Not configured (local development).
	}
	if ( '' === $response ) {
		return new WP_Error( 'iim_turnstile_missing', __( 'Please complete the spam check.', 'iim-core' ) );
	}
	$res = wp_remote_post(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		array(
			'timeout' => 8,
			'body'    => array(
				'secret'   => IIM_TURNSTILE_SECRET_KEY,
				'response' => $response,
				'remoteip' => iim_core_client_ip(),
			),
		)
	);
	if ( is_wp_error( $res ) ) {
		// Fail open on a Cloudflare outage so real customers are not blocked; the lead is flagged.
		return new WP_Error( 'iim_turnstile_unreachable', 'unreachable' );
	}
	$body = json_decode( wp_remote_retrieve_body( $res ), true );
	if ( empty( $body['success'] ) ) {
		return new WP_Error( 'iim_turnstile_failed', __( 'The spam check failed. Please try again.', 'iim-core' ) );
	}
	return true;
}

/**
 * Run every check in order. Returns an array of flags for the lead record, or WP_Error to reject.
 *
 * @param WP_REST_Request $request Request.
 * @return array|WP_Error
 */
function iim_core_run_spam_checks( WP_REST_Request $request ) {
	$flags = array();

	// Honeypot: silently accept-and-drop is handled by the caller (bots get a normal-looking success).
	if ( '' !== trim( (string) $request->get_param( 'company_website' ) ) ) {
		return new WP_Error( 'iim_honeypot', 'honeypot' );
	}

	if ( ! wp_verify_nonce( (string) $request->get_param( '_iim_nonce' ), 'iim_lead' ) ) {
		// Nonces in long-cached pages can expire; the signed token below still proves origin.
		$flags[] = 'nonce_stale';
	}

	$token = iim_core_check_form_token( (string) $request->get_param( '_iim_token' ) );
	if ( is_wp_error( $token ) ) {
		return $token;
	}

	$rate = iim_core_check_rate_limit();
	if ( is_wp_error( $rate ) ) {
		return $rate;
	}

	$js = '1' === (string) $request->get_param( '_iim_js' );
	if ( $js ) {
		$ts = iim_core_verify_turnstile( (string) $request->get_param( 'cf-turnstile-response' ) );
		if ( is_wp_error( $ts ) ) {
			if ( 'iim_turnstile_unreachable' === $ts->get_error_code() ) {
				$flags[] = 'turnstile_unreachable';
			} else {
				return $ts;
			}
		}
	} else {
		// Turnstile needs JavaScript. No-JS submissions rely on the other checks and are flagged for review.
		$flags[] = 'no_js';
	}

	if ( in_array( 'nonce_stale', $flags, true ) && ! $js ) {
		return new WP_Error( 'iim_nonce', __( 'Your session expired. Please reload the page and try again.', 'iim-core' ) );
	}

	return $flags;
}
