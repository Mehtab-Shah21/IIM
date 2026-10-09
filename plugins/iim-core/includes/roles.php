<?php
/**
 * Roles and capabilities (least privilege).
 *
 * Administrator: developer only, everything.
 * SEO Manager:   Editor + Rank Math (titles, schema, sitemap, robots, redirects, 404 monitor) +
 *                Business Info. No plugins, themes, users, settings or leads.
 * Editor:        the owner's optional account. Content, Business Info and leads.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

const IIM_CORE_ROLES_VERSION = 2;

/**
 * Capabilities of the private lead post type.
 */
function iim_core_lead_caps() {
	return array( 'edit_iim_leads', 'edit_others_iim_leads', 'edit_private_iim_leads', 'edit_published_iim_leads', 'read_private_iim_leads', 'delete_iim_leads', 'delete_others_iim_leads', 'delete_private_iim_leads', 'delete_published_iim_leads', 'publish_iim_leads' );
}

/**
 * Rank Math capabilities for the SEO Manager (everything except managing roles).
 */
function iim_core_rank_math_caps() {
	return array( 'rank_math_titles', 'rank_math_general', 'rank_math_sitemap', 'rank_math_404_monitor', 'rank_math_link_builder', 'rank_math_redirections', 'rank_math_analytics', 'rank_math_site_analysis', 'rank_math_onpage_analysis', 'rank_math_onpage_general', 'rank_math_onpage_advanced', 'rank_math_onpage_snippet', 'rank_math_onpage_social', 'rank_math_admin_bar' );
}

/**
 * Create or update roles. Runs on activation and whenever IIM_CORE_ROLES_VERSION changes.
 */
function iim_core_register_roles() {
	$editor = get_role( 'editor' );
	$caps   = $editor ? $editor->capabilities : array( 'read' => true );

	// Never let the SEO Manager touch users, plugins, themes or core settings.
	foreach ( array( 'edit_users', 'list_users', 'create_users', 'delete_users', 'promote_users', 'install_plugins', 'activate_plugins', 'edit_plugins', 'update_plugins', 'delete_plugins', 'switch_themes', 'edit_themes', 'install_themes', 'update_themes', 'delete_themes', 'edit_theme_options', 'manage_options', 'update_core', 'unfiltered_html', 'import', 'export' ) as $deny ) {
		unset( $caps[ $deny ] );
	}

	remove_role( 'seo_manager' );
	add_role( 'seo_manager', __( 'SEO Manager', 'iim-core' ), $caps );

	$seo = get_role( 'seo_manager' );
	foreach ( iim_core_rank_math_caps() as $cap ) {
		$seo->add_cap( $cap );
	}
	$seo->add_cap( 'iim_manage_business_info' );

	foreach ( array( 'administrator', 'editor' ) as $role_name ) {
		$role = get_role( $role_name );
		if ( ! $role ) {
			continue;
		}
		$role->add_cap( 'iim_manage_business_info' );
		foreach ( iim_core_lead_caps() as $cap ) {
			$role->add_cap( $cap );
		}
	}

	update_option( 'iim_core_roles_version', IIM_CORE_ROLES_VERSION );
}

add_action(
	'admin_init',
	function () {
		if ( (int) get_option( 'iim_core_roles_version' ) !== IIM_CORE_ROLES_VERSION ) {
			iim_core_register_roles();
		}
	}
);
