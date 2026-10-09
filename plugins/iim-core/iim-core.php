<?php
/**
 * Plugin Name: IIM Core
 * Description: Content types, Business Info, quote and contract forms, lead storage, webhook delivery, schema additions, legacy redirects and hardening for IIM Technical Services. Survives a theme change.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: IIM Technical Services
 * Text Domain: iim-core
 * Domain Path: /languages
 * License: Proprietary
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

define( 'IIM_CORE_VERSION', '1.0.0' );
define( 'IIM_CORE_FILE', __FILE__ );
define( 'IIM_CORE_DIR', plugin_dir_path( __FILE__ ) );

/*
 * Secrets and environment settings are read from wp-config.php constants (never the database or repo):
 *   IIM_WEBHOOK_URL, IIM_WEBHOOK_SECRET, IIM_TURNSTILE_SITE_KEY, IIM_TURNSTILE_SECRET_KEY,
 *   IIM_LOGIN_SLUG, IIM_TRUST_CF_IP, IIM_CORE_UNINSTALL_DELETE_DATA.
 * See server/wp-config-additions.php.
 */

foreach ( array( 'options', 'post-types', 'fields', 'roles', 'form-security', 'uploads', 'leads', 'mail', 'webhook', 'rest', 'schema', 'redirects', 'hardening', 'seo', 'admin' ) as $iim_core_file ) {
	require_once IIM_CORE_DIR . 'includes/' . $iim_core_file . '.php';
}
unset( $iim_core_file );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once IIM_CORE_DIR . 'includes/cli.php';
}

add_action(
	'plugins_loaded',
	function () {
		load_plugin_textdomain( 'iim-core', false, dirname( plugin_basename( IIM_CORE_FILE ) ) . '/languages' );
	}
);

register_activation_hook(
	__FILE__,
	function () {
		iim_core_register_post_types();
		iim_core_register_roles();
		iim_core_protect_upload_dir();
		iim_core_schedule_events();
		flush_rewrite_rules();
	}
);

register_deactivation_hook(
	__FILE__,
	function () {
		wp_clear_scheduled_hook( 'iim_core_retry_webhooks' );
		wp_clear_scheduled_hook( 'iim_core_purge_old_leads' );
		flush_rewrite_rules();
	}
);
