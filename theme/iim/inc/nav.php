<?php
/**
 * Primary navigation (Home, Services mega menu, Annual Contract, About, Projects, Contact),
 * mobile drawer and breadcrumbs.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

/**
 * Primary nav items. Filterable so items can be added without editing templates.
 *
 * @return array<int,array{key:string,label:string,url:string}>
 */
function iim_primary_nav() {
	$items = array(
		array( 'key' => 'home', 'label' => __( 'Home', 'iim' ), 'url' => home_url( '/' ) ),
		array( 'key' => 'services', 'label' => __( 'Services', 'iim' ), 'url' => post_type_exists( 'service' ) ? get_post_type_archive_link( 'service' ) : home_url( '/services/' ) ),
		array( 'key' => 'amc', 'label' => __( 'Annual Contract', 'iim' ), 'url' => iim_page_url( 'annual-maintenance-contract' ) ),
		array( 'key' => 'about', 'label' => __( 'About', 'iim' ), 'url' => iim_page_url( 'about' ) ),
		array( 'key' => 'projects', 'label' => __( 'Projects', 'iim' ), 'url' => post_type_exists( 'project' ) ? get_post_type_archive_link( 'project' ) : home_url( '/projects/' ) ),
		array( 'key' => 'contact', 'label' => __( 'Contact', 'iim' ), 'url' => iim_page_url( 'contact' ) ),
	);
	return apply_filters( 'iim_primary_nav', $items );
}

/**
 * Whether a nav item is the current section.
 *
 * @param string $key Item key.
 */
function iim_nav_is_current( $key ) {
	switch ( $key ) {
		case 'home':
			return is_front_page();
		case 'services':
			return is_post_type_archive( 'service' ) || is_singular( 'service' );
		case 'projects':
			return is_post_type_archive( 'project' ) || is_singular( 'project' );
		case 'amc':
			return is_page( 'annual-maintenance-contract' ) || ( is_page() && in_array( (int) get_page_by_path( 'annual-maintenance-contract' )?->ID, get_post_ancestors( get_queried_object_id() ), true ) );
		default:
			return is_page( $key );
	}
}

/**
 * Breadcrumbs. Uses Rank Math's breadcrumbs when available, so the visible trail always matches
 * Rank Math's BreadcrumbList schema. Falls back to a simple trail.
 */
function iim_breadcrumbs() {
	if ( is_front_page() ) {
		return;
	}
	echo '<nav class="breadcrumbs" aria-label="' . esc_attr__( 'Breadcrumb', 'iim' ) . '">';
	$trail = array();

	// Rank Math's crumb list: [ text, url, hide_in_schema ]. Same data as its BreadcrumbList schema.
	if ( class_exists( '\RankMath\Frontend\Breadcrumbs' ) ) {
		$crumbs = \RankMath\Frontend\Breadcrumbs::get()->get_crumbs();
		if ( is_array( $crumbs ) ) {
			$last = count( $crumbs ) - 1;
			foreach ( array_values( $crumbs ) as $i => $crumb ) {
				$trail[] = array( (string) ( $crumb[0] ?? '' ), $i === $last ? '' : (string) ( $crumb[1] ?? '' ) );
			}
		}
	}

	if ( ! $trail ) {
		$trail  = array( array( __( 'Home', 'iim' ), home_url( '/' ) ) );
		$object = get_queried_object();
		if ( is_singular() && $object ) {
			$type = get_post_type_object( $object->post_type );
			if ( $type && $type->has_archive ) {
				$trail[] = array( $type->labels->name, get_post_type_archive_link( $object->post_type ) );
			}
			foreach ( array_reverse( get_post_ancestors( $object ) ) as $ancestor ) {
				$trail[] = array( get_the_title( $ancestor ), get_permalink( $ancestor ) );
			}
			$trail[] = array( get_the_title( $object ), '' );
		} elseif ( is_post_type_archive() ) {
			$trail[] = array( post_type_archive_title( '', false ), '' );
		} elseif ( is_search() ) {
			$trail[] = array( __( 'Search', 'iim' ), '' );
		} elseif ( is_404() ) {
			$trail[] = array( __( 'Page not found', 'iim' ), '' );
		}
	}

	echo '<ol>';
	foreach ( $trail as $crumb ) {
		echo $crumb[1]
			? '<li><a href="' . esc_url( $crumb[1] ) . '">' . esc_html( $crumb[0] ) . '</a></li>'
			: '<li aria-current="page">' . esc_html( $crumb[0] ) . '</li>';
	}
	echo '</ol>';
	echo '</nav>';
}
