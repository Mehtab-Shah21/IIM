<?php
/**
 * Uninstall cleanup. Removes roles, capabilities, options and scheduled jobs.
 * Leads, photos and content are kept unless IIM_CORE_UNINSTALL_DELETE_DATA is true in wp-config.php,
 * because deleting customer records by accident cannot be undone.
 *
 * @package iim-core
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

wp_clear_scheduled_hook( 'iim_core_retry_webhooks' );
wp_clear_scheduled_hook( 'iim_core_purge_old_leads' );

remove_role( 'seo_manager' );
foreach ( array( 'administrator', 'editor' ) as $iim_role_name ) {
	$iim_role = get_role( $iim_role_name );
	if ( ! $iim_role ) {
		continue;
	}
	$iim_role->remove_cap( 'iim_manage_business_info' );
	foreach ( array( 'edit_iim_leads', 'edit_others_iim_leads', 'edit_private_iim_leads', 'edit_published_iim_leads', 'read_private_iim_leads', 'delete_iim_leads', 'delete_others_iim_leads', 'delete_private_iim_leads', 'delete_published_iim_leads', 'publish_iim_leads' ) as $iim_cap ) {
		$iim_role->remove_cap( $iim_cap );
	}
}
delete_option( 'iim_core_roles_version' );

if ( defined( 'IIM_CORE_UNINSTALL_DELETE_DATA' ) && IIM_CORE_UNINSTALL_DELETE_DATA ) {
	$iim_ids = get_posts(
		array(
			'post_type'      => array( 'lead' ),
			'post_status'    => 'any',
			'fields'         => 'ids',
			'posts_per_page' => -1,
		)
	);
	foreach ( $iim_ids as $iim_id ) {
		wp_delete_post( $iim_id, true );
	}

	$iim_uploads = wp_upload_dir( null, false );
	$iim_dir     = trailingslashit( $iim_uploads['basedir'] ) . 'iim-leads';
	if ( is_dir( $iim_dir ) ) {
		$iim_it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $iim_dir, FilesystemIterator::SKIP_DOTS ), RecursiveIteratorIterator::CHILD_FIRST );
		foreach ( $iim_it as $iim_file ) {
			$iim_file->isDir() ? rmdir( $iim_file->getPathname() ) : unlink( $iim_file->getPathname() ); // phpcs:ignore
		}
		rmdir( $iim_dir ); // phpcs:ignore
	}

	global $wpdb;
	// Business Info values (ACF options page). Only IIM uses ACF options on this site.
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'options\\_%' OR option_name LIKE '\\_options\\_%'" ); // phpcs:ignore
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_iim\\_%' OR option_name LIKE '\\_transient\\_timeout\\_iim\\_%'" ); // phpcs:ignore
}
