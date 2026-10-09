<?php
/**
 * SEO guards that must not depend on editor settings:
 * - Staging and local environments are noindex, nofollow everywhere (WP_ENVIRONMENT_TYPE).
 * - Thank-you, style guide, search and lead pages are always noindex.
 * Everything else (titles, descriptions, canonicals, sitemap, robots.txt) is managed in Rank Math.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Whether this request must be noindex regardless of Rank Math settings.
 */
function iim_core_force_noindex() {
	if ( 'production' !== wp_get_environment_type() ) {
		return true;
	}
	return is_search()
		|| is_page( 'thank-you' )
		|| is_page_template( 'templates/page-thank-you.php' )
		|| is_page_template( 'templates/page-styleguide.php' )
		|| isset( $_GET['iim_form'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

// Rank Math robots meta.
add_filter(
	'rank_math/frontend/robots',
	function ( $robots ) {
		if ( iim_core_force_noindex() ) {
			$robots['index']  = 'noindex';
			$robots['follow'] = 'production' === wp_get_environment_type() ? 'follow' : 'nofollow';
		}
		return $robots;
	}
);

// Core robots meta (used when Rank Math is inactive).
add_filter(
	'wp_robots',
	function ( $robots ) {
		if ( iim_core_force_noindex() ) {
			$robots['noindex'] = true;
			unset( $robots['max-image-preview'] );
			if ( 'production' !== wp_get_environment_type() ) {
				$robots['nofollow'] = true;
			}
		}
		return $robots;
	}
);

// Belt and braces on staging: header-level noindex, also covers files and feeds.
add_action(
	'send_headers',
	function () {
		if ( 'production' !== wp_get_environment_type() ) {
			header( 'X-Robots-Tag: noindex, nofollow', true );
		}
	}
);

// Keep the thank-you page out of the sitemap.
add_filter(
	'rank_math/sitemap/exclude_post',
	function ( $exclude, $post ) {
		if ( $post && 'page' === $post->post_type && in_array( get_page_template_slug( $post ), array( 'templates/page-thank-you.php', 'templates/page-styleguide.php' ), true ) ) {
			return true;
		}
		return $exclude;
	},
	10,
	2
);

// Show the environment in the admin bar so nobody edits the wrong site.
add_action(
	'admin_bar_menu',
	function ( $bar ) {
		$env = wp_get_environment_type();
		if ( 'production' === $env ) {
			return;
		}
		$bar->add_node(
			array(
				'id'    => 'iim-env',
				/* translators: %s: environment name. */
				'title' => esc_html( sprintf( __( '%s (noindex)', 'iim-core' ), strtoupper( $env ) ) ),
			)
		);
	},
	1
);
