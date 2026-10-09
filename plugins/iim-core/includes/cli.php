<?php
/**
 * WP-CLI commands.
 *
 *   wp iim seed [--update]      Create pages, services, FAQs, testimonials and SEO meta from seed/content.json.
 *   wp iim retry-webhooks       Retry every pending or failed lead delivery now.
 *   wp iim test-webhook         Send a signed test payload to IIM_WEBHOOK_URL.
 *   wp iim check                Report missing Business Info, placeholders and unconfirmed claims.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * IIM site commands.
 */
class IIM_Core_CLI {

	/**
	 * Seed content. Existing items (matched by slug) are skipped unless --update is given.
	 *
	 * ## OPTIONS
	 *
	 * [--update]
	 * : Overwrite fields of existing items.
	 *
	 * @param array $args       Positional.
	 * @param array $assoc_args Flags.
	 */
	public function seed( $args, $assoc_args ) {
		$result = iim_core_seed( ! empty( $assoc_args['update'] ), array( 'WP_CLI', 'log' ) );
		if ( is_wp_error( $result ) ) {
			WP_CLI::error( $result->get_error_message() );
		}
		WP_CLI::success( 'Seed complete. Next: fill in Business Info, then run `wp iim check`.' );
	}

	/**
	 * Retry all pending or failed lead deliveries now.
	 */
	public function retry_webhooks() {
		$ids = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => -1,
				'meta_query'     => array( array( 'key' => '_iim_webhook_status', 'value' => array( 'pending', 'failed' ), 'compare' => 'IN' ) ), // phpcs:ignore
			)
		);
		foreach ( $ids as $id ) {
			update_post_meta( $id, '_iim_webhook_attempts', 0 );
			WP_CLI::log( get_post_meta( $id, '_iim_ref', true ) . ': ' . ( iim_core_deliver_webhook( $id ) ? 'sent' : 'failed' ) );
		}
		WP_CLI::success( count( $ids ) . ' lead(s) processed.' );
	}

	/**
	 * Send a signed test payload to the webhook.
	 */
	public function test_webhook() {
		if ( ! defined( 'IIM_WEBHOOK_URL' ) || ! IIM_WEBHOOK_URL ) {
			WP_CLI::error( 'IIM_WEBHOOK_URL is not defined in wp-config.php.' );
		}
		$body = wp_json_encode( array( 'event' => 'test', 'sent_at' => gmdate( 'c' ) ) );
		$ts   = time();
		$sig  = hash_hmac( 'sha256', $ts . '.' . $body, defined( 'IIM_WEBHOOK_SECRET' ) ? IIM_WEBHOOK_SECRET : '' );
		$res  = wp_remote_post( IIM_WEBHOOK_URL, array( 'timeout' => 10, 'headers' => array( 'Content-Type' => 'application/json', 'X-IIM-Signature' => "t={$ts},v1={$sig}" ), 'body' => $body ) );
		if ( is_wp_error( $res ) ) {
			WP_CLI::error( $res->get_error_message() );
		}
		WP_CLI::success( 'HTTP ' . wp_remote_retrieve_response_code( $res ) );
	}

	/**
	 * Pre-launch check: Business Info gaps, unconfirmed claims, placeholder text left in content.
	 */
	public function check() {
		$warn = 0;
		foreach ( array( 'business_name', 'phone_e164', 'whatsapp_e164', 'email', 'owner_email', 'address_street', 'hours_text', 'license_number', 'gbp_url', 'review_url' ) as $k ) {
			if ( ! get_field( $k, 'option' ) ) {
				WP_CLI::warning( "Business Info: '{$k}' is empty." );
				++$warn;
			}
		}
		foreach ( array( 'dewa_show', 'claim_247', 'free_quote', 'rating_show', 'show_prices' ) as $k ) {
			WP_CLI::log( sprintf( 'Claim %-12s %s', $k, get_field( $k, 'option' ) ? 'ON  (confirmed in writing?)' : 'off' ) );
		}
		foreach ( array( 'IIM_WEBHOOK_URL', 'IIM_WEBHOOK_SECRET', 'IIM_TURNSTILE_SITE_KEY', 'IIM_TURNSTILE_SECRET_KEY', 'IIM_LOGIN_SLUG' ) as $c ) {
			if ( ! defined( $c ) || ! constant( $c ) ) {
				WP_CLI::warning( "wp-config.php: {$c} is not set." );
				++$warn;
			}
		}
		global $wpdb;
		$hits = $wpdb->get_col( "SELECT DISTINCT p.ID FROM {$wpdb->posts} p LEFT JOIN {$wpdb->postmeta} m ON m.post_id = p.ID WHERE p.post_status = 'publish' AND ( p.post_content LIKE '%[CONFIRM%' OR m.meta_value LIKE '%[CONFIRM%' )" ); // phpcs:ignore
		foreach ( $hits as $id ) {
			WP_CLI::warning( 'Published content contains [CONFIRM]: ' . get_the_title( $id ) . ' (' . get_permalink( $id ) . ')' );
			++$warn;
		}
		if ( 'production' === wp_get_environment_type() && get_option( 'blog_public' ) === '0' ) {
			WP_CLI::warning( 'Production has "Discourage search engines" switched on.' );
			++$warn;
		}
		$warn ? WP_CLI::warning( "{$warn} issue(s) to resolve before launch." ) : WP_CLI::success( 'No issues found.' );
	}
}

WP_CLI::add_command( 'iim', 'IIM_Core_CLI' );
