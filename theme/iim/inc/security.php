<?php
/**
 * Theme-level output hardening. Site-wide hardening (XML-RPC, enumeration, login URL, headers fallback)
 * lives in the iim-core plugin so it survives a theme change.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

// Hide the WordPress version.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// Strip ?ver=<core version> from core asset URLs (our own assets use file modification times).
add_filter( 'style_loader_src', 'iim_strip_core_version', 9999 );
add_filter( 'script_loader_src', 'iim_strip_core_version', 9999 );

/**
 * Remove the core version query arg.
 *
 * @param string $src Asset URL.
 */
function iim_strip_core_version( $src ) {
	if ( $src && strpos( $src, 'ver=' . get_bloginfo( 'version' ) ) !== false ) {
		$src = remove_query_arg( 'ver', $src );
	}
	return $src;
}

// External links opened in a new tab never leak window.opener.
add_filter(
	'wp_targeted_link_rel',
	fn( $rel ) => trim( $rel . ' noopener noreferrer' )
);
