<?php
/**
 * Legacy Wix URL map: one-hop 301s to the new URLs and 410 Gone for Wix demo-store pages.
 * Runs only on 404s, before WordPress tries to guess, so new pages are never affected.
 *
 * New redirects created after launch belong in Rank Math > Redirections (managed by the SEO Manager).
 * Source of truth for this map: docs/01-current-site-audit.md (section 2) and docs/redirects.csv.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Exact old path (no trailing slash, lowercase) => new path.
 */
function iim_core_legacy_redirects() {
	return apply_filters(
		'iim_core_legacy_redirects',
		array(
			'/coming-soon-01'                                => '/',
			'/copy-of-ac-services'                           => '/services/electrical-services-dubai/',
			'/copy-of-electrical-services'                   => '/services/plumbing-services-dubai/',
			'/copy-of-plumbing-services'                     => '/services/painting-services-dubai/',
			'/copy-of-painting-services'                     => '/services/handyman-services-dubai/',
			'/copy-of-handyman-services'                     => '/services/emergency-electrician-plumber-dubai/',
			'/services-4-1'                                  => '/services/ac-services-dubai/',
			'/book-online'                                   => '/services/',
			'/inquiry-services-page'                         => '/services/',
			'/service-page/ac-deep-cleaning'                 => '/services/ac-services-dubai/',
			'/service-page/ac-routine-maintenance'           => '/services/ac-services-dubai/',
			'/service-page/ac-repair-troubleshooting'        => '/services/ac-services-dubai/',
			'/service-page/db-dressing-upgrades'             => '/services/electrical-services-dubai/',
			'/service-page/electrical-fault-finding'         => '/services/electrical-services-dubai/',
			'/service-page/lighting-installation'            => '/services/electrical-services-dubai/',
			'/service-page/signage-installation'             => '/services/electrical-services-dubai/',
			'/service-page/flowing-perfection-zero-leaks'    => '/services/plumbing-services-dubai/',
			'/service-page/water-heater-services'            => '/services/plumbing-services-dubai/',
			'/service-page/sanitary-ware-installation'       => '/services/plumbing-services-dubai/',
			'/service-page/waterproofing-solutions'          => '/services/home-renovation-dubai/',
			'/service-page/tiling-masonry'                   => '/services/home-renovation-dubai/',
			'/service-page/interior-exterior-painting'       => '/services/painting-services-dubai/',
			'/lead-collection'                               => '/annual-maintenance-contract/residential/',
			'/registration'                                  => '/annual-maintenance-contract/commercial/',
			'/about-us'                                      => '/about/',
			'/accessibility-statement'                       => '/accessibility/',
		)
	);
}

/**
 * Old paths (prefixes) that are permanently gone: Wix demo store and empty pricing page.
 */
function iim_core_gone_prefixes() {
	return apply_filters( 'iim_core_gone_prefixes', array( '/product-page/', '/category/all-products', '/pricing-plans', '/service-list', '/_partials', '/blank' ) );
}

/**
 * Resolve an old path to [ status, target ].
 *
 * @param string $path Request path.
 * @return array{0:int,1:string}|null
 */
function iim_core_resolve_legacy( $path ) {
	$path = strtolower( '/' . trim( rawurldecode( $path ), '/' ) );

	// Arabic copies (/ar, /ar/...) go to their English equivalent.
	if ( '/ar' === $path ) {
		return array( 301, '/' );
	}
	if ( 0 === strpos( $path, '/ar/' ) ) {
		$path = substr( $path, 3 );
		$map  = iim_core_legacy_redirects();
		if ( isset( $map[ $path ] ) ) {
			return array( 301, $map[ $path ] );
		}
		// The English page may exist under the same slug (e.g. /ar/contact -> /contact/).
		$page = get_page_by_path( ltrim( $path, '/' ) );
		return $page ? array( 301, wp_make_link_relative( get_permalink( $page ) ) ) : array( 301, '/' );
	}

	$map = iim_core_legacy_redirects();
	if ( isset( $map[ $path ] ) ) {
		return array( 301, $map[ $path ] );
	}

	foreach ( iim_core_gone_prefixes() as $prefix ) {
		if ( 0 === strpos( $path, $prefix ) ) {
			return array( 410, '' );
		}
	}
	return null;
}

add_action(
	'template_redirect',
	function () {
		if ( ! is_404() ) {
			return;
		}
		$path = (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$hit  = iim_core_resolve_legacy( $path );
		if ( ! $hit ) {
			return;
		}
		if ( 410 === $hit[0] ) {
			status_header( 410 );
			nocache_headers();
			return; // The theme's 404 template renders with a 410 status.
		}
		wp_safe_redirect( home_url( $hit[1] ), 301, 'IIM legacy' );
		exit;
	},
	1
);

// Never guess a "closest" URL for a 404: that creates surprise redirects and redirects to the home page.
add_filter( 'do_redirect_guess_404_permalink', '__return_false' );
