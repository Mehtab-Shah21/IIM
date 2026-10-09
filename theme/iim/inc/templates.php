<?php
/**
 * Template routing: hierarchy templates live in /templates instead of the theme root.
 * Page templates in /templates are picked up natively by WordPress (one directory deep).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_template_types = array( 'index', '404', 'archive', 'author', 'category', 'tag', 'taxonomy', 'date', 'home', 'frontpage', 'page', 'search', 'single', 'singular', 'attachment', 'privacypolicy' );

foreach ( $iim_template_types as $iim_type ) {
	add_filter(
		"{$iim_type}_template_hierarchy",
		function ( $templates ) {
			$routed = array();
			foreach ( $templates as $template ) {
				if ( 0 !== strpos( $template, 'templates/' ) ) {
					$routed[] = 'templates/' . $template;
				}
				$routed[] = $template;
			}
			return $routed;
		}
	);
}
unset( $iim_template_types, $iim_type );

/**
 * Body classes for layout hooks.
 */
add_filter(
	'body_class',
	function ( $classes ) {
		if ( is_front_page() ) {
			$classes[] = 'is-home';
		}
		return $classes;
	}
);

/**
 * Archive page sizes: hubs show everything on one page (small, curated lists).
 */
add_action(
	'pre_get_posts',
	function ( $query ) {
		if ( is_admin() || ! $query->is_main_query() ) {
			return;
		}
		if ( $query->is_post_type_archive( array( 'service', 'area' ) ) ) {
			$query->set( 'posts_per_page', 50 );
			$query->set( 'orderby', array( 'menu_order' => 'ASC', 'title' => 'ASC' ) );
		}
		if ( $query->is_post_type_archive( array( 'project', 'guide' ) ) ) {
			$query->set( 'posts_per_page', 12 );
		}
	}
);
