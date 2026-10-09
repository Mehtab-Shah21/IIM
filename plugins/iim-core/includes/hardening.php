<?php
/**
 * WordPress hardening: file editing off, XML-RPC off, no user enumeration, no author archives,
 * no comments, generic login errors, optional custom login URL (IIM_LOGIN_SLUG), optional PHP
 * fallback for security headers (prefer server-level headers: server/security-headers.conf).
 *
 * Brute-force limits and 2FA come from Wordfence and WP 2FA.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

// XML-RPC and pingbacks.
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' );
add_filter(
	'wp_headers',
	function ( $headers ) {
		unset( $headers['X-Pingback'] );
		return $headers;
	}
);
add_filter( 'pings_open', '__return_false' );

// Application passwords are not used by this site.
add_filter( 'wp_is_application_passwords_available', '__return_false' );

// REST user enumeration: hide /wp/v2/users from visitors (the editor still works when logged in).
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		if ( is_user_logged_in() ) {
			return $endpoints;
		}
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
				unset( $endpoints[ $route ] );
			}
		}
		return $endpoints;
	}
);

// ?author=N scans and author archives: 404.
add_action(
	'template_redirect',
	function () {
		if ( is_author() || ( isset( $_GET['author'] ) && ! is_admin() ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
		}
	},
	0
);
add_filter( 'author_link', fn() => home_url( '/about/' ) );
add_filter( 'oembed_response_data', function ( $data ) {
	unset( $data['author_name'], $data['author_url'] );
	return $data;
} );

// Comments are not used anywhere on the site.
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 20 );
add_action(
	'init',
	function () {
		foreach ( get_post_types() as $type ) {
			if ( post_type_supports( $type, 'comments' ) ) {
				remove_post_type_support( $type, 'comments' );
				remove_post_type_support( $type, 'trackbacks' );
			}
		}
	},
	100
);
add_action( 'admin_menu', fn() => remove_menu_page( 'edit-comments.php' ) );

// Generic login errors (do not reveal whether a username exists).
add_filter( 'login_errors', fn() => __( 'Login failed. Check your details and try again.', 'iim-core' ) );

/*
 * ---------- Custom login URL ----------
 * Define IIM_LOGIN_SLUG in wp-config.php (e.g. 'iim-staff-login'). /wp-login.php and /wp-admin/
 * then return 404 to visitors who are not logged in. Admin-ajax and admin-post keep working.
 */
if ( defined( 'IIM_LOGIN_SLUG' ) && IIM_LOGIN_SLUG && ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {

	/**
	 * Request path relative to the site root.
	 */
	function iim_core_request_path() {
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$path = (string) wp_parse_url( $uri, PHP_URL_PATH );
		$base = (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		if ( $base && '/' !== $base && 0 === strpos( $path, $base ) ) {
			$path = '/' . substr( $path, strlen( $base ) );
		}
		return trim( $path, '/' );
	}

	/**
	 * Replace wp-login.php with the custom slug in a URL.
	 *
	 * @param string $url URL.
	 */
	function iim_core_swap_login_url( $url ) {
		if ( false === strpos( $url, 'wp-login.php' ) ) {
			return $url;
		}
		$parts = explode( '?', $url, 2 );
		$out   = home_url( '/' . IIM_LOGIN_SLUG . '/' );
		return isset( $parts[1] ) ? $out . '?' . $parts[1] : $out;
	}

	add_action(
		'plugins_loaded',
		function () {
			$path = iim_core_request_path();
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$action = isset( $_GET['action'] ) ? sanitize_key( $_GET['action'] ) : '';

			if ( untrailingslashit( IIM_LOGIN_SLUG ) === $path ) {
				$GLOBALS['iim_core_is_login'] = true;
				return;
			}

			$is_login_file = 'wp-login.php' === basename( $path ) || 'wp-signup.php' === basename( $path ) || 'wp-register.php' === basename( $path );
			if ( $is_login_file && 'postpass' !== $action ) {
				iim_core_hidden_404();
			}

			$is_admin_path = 0 === strpos( $path, 'wp-admin' );
			$allowed_admin = in_array( basename( $path ), array( 'admin-ajax.php', 'admin-post.php' ), true );
			if ( $is_admin_path && ! $allowed_admin && ! is_user_logged_in() ) {
				iim_core_hidden_404();
			}
		},
		1
	);

	add_action(
		'wp_loaded',
		function () {
			if ( empty( $GLOBALS['iim_core_is_login'] ) ) {
				return;
			}
			// wp-login.php expects these globals.
			global $error, $interim_login, $action, $user_login, $user, $redirect_to; // phpcs:ignore
			@require_once ABSPATH . 'wp-login.php'; // phpcs:ignore
			exit;
		}
	);

	/**
	 * Plain 404 without revealing the login page.
	 */
	function iim_core_hidden_404() {
		status_header( 404 );
		nocache_headers();
		header( 'Content-Type: text/html; charset=utf-8' );
		echo '<!doctype html><title>404</title><p>Not found.</p>';
		exit;
	}

	foreach ( array( 'site_url', 'network_site_url', 'wp_redirect', 'login_url', 'logout_url', 'lostpassword_url', 'register_url' ) as $iim_core_hook ) {
		add_filter( $iim_core_hook, 'iim_core_swap_login_url', 100 );
	}
	unset( $iim_core_hook );
}

/*
 * ---------- Security headers (PHP fallback) ----------
 * Prefer server-level headers (they also cover static files). Enable this only if the host
 * cannot set headers: define( 'IIM_SEND_SECURITY_HEADERS', true );
 */
add_action(
	'send_headers',
	function () {
		if ( ! defined( 'IIM_SEND_SECURITY_HEADERS' ) || ! IIM_SEND_SECURITY_HEADERS || is_admin() ) {
			return;
		}
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		header( 'Content-Security-Policy-Report-Only: ' . iim_core_csp() );
	}
);

/**
 * Content Security Policy. Matches server/security-headers.conf; keep both in sync.
 */
function iim_core_csp() {
	return implode(
		'; ',
		array(
			"default-src 'self'",
			"script-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com 'unsafe-hashes' 'sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc='",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com",
			'frame-src https://challenges.cloudflare.com https://www.google.com',
			"frame-ancestors 'self'",
			"form-action 'self'",
			"base-uri 'self'",
			"object-src 'none'",
			'upgrade-insecure-requests',
		)
	);
}
