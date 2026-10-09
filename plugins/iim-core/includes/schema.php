<?php
/**
 * Structured data additions, injected into Rank Math's JSON-LD graph so there is one graph and no
 * duplicates. Rank Math owns Organization, WebSite, WebPage, BreadcrumbList and Article.
 * We add: LocalBusiness (HomeAndConstructionBusiness + Electrician + Plumber), Service, FAQPage and,
 * only where the rating is visible, AggregateRating. Every value comes from Business Info or fields.
 *
 * If Rank Math is inactive, the same nodes are printed as a standalone @graph.
 *
 * Do not add FAQ or LocalBusiness schema in Rank Math's Schema tab as well, or they will duplicate.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * @id of the business node.
 */
function iim_core_business_id() {
	return home_url( '/#localbusiness' );
}

/**
 * areaServed: Area posts if any, otherwise the list in Business Info, otherwise Dubai.
 */
function iim_core_area_served() {
	$names = post_type_exists( 'area' ) ? wp_list_pluck( get_posts( array( 'post_type' => 'area', 'posts_per_page' => 100, 'no_found_rows' => true ) ), 'post_title' ) : array();
	if ( ! $names ) {
		$names = array_filter( array_map( 'trim', explode( "\n", (string) iim_core_get_option( 'service_areas' ) ) ) );
	}
	$places = array_map( fn( $n ) => array( '@type' => 'Place', 'name' => $n . ', Dubai' ), $names );
	$places[] = array( '@type' => 'City', 'name' => 'Dubai' );
	return $places;
}

/**
 * LocalBusiness node.
 */
function iim_core_schema_business() {
	$o    = 'iim_core_get_option';
	$node = array(
		'@type'     => apply_filters( 'iim_core_business_types', array( 'HomeAndConstructionBusiness', 'Electrician', 'Plumber' ) ),
		'@id'       => iim_core_business_id(),
		'name'      => $o( 'business_name' ),
		'legalName' => $o( 'legal_name' ),
		'url'       => home_url( '/' ),
		'telephone' => $o( 'phone_e164' ),
		'email'     => $o( 'email' ),
		'address'   => array_filter(
			array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => $o( 'address_street' ),
				'addressLocality' => $o( 'address_locality' ),
				'addressRegion'   => $o( 'address_region' ),
				'addressCountry'  => $o( 'address_country' ),
			)
		),
		'areaServed' => iim_core_area_served(),
	);

	$logo_id = (int) get_theme_mod( 'custom_logo' );
	if ( $logo_id ) {
		$node['logo']  = wp_get_attachment_image_url( $logo_id, 'full' );
		$node['image'] = $node['logo'];
	}

	if ( $o( 'geo_lat' ) && $o( 'geo_lng' ) ) {
		$node['geo'] = array( '@type' => 'GeoCoordinates', 'latitude' => (float) $o( 'geo_lat' ), 'longitude' => (float) $o( 'geo_lng' ) );
	}

	$hours = array();
	foreach ( (array) $o( 'opening_hours' ) as $row ) {
		if ( empty( $row['days'] ) || empty( $row['opens'] ) || empty( $row['closes'] ) ) {
			continue;
		}
		$hours[] = array(
			'@type'     => 'OpeningHoursSpecification',
			'dayOfWeek' => array_values( (array) $row['days'] ),
			'opens'     => $row['opens'],
			'closes'    => $row['closes'],
		);
	}
	if ( $hours ) {
		$node['openingHoursSpecification'] = $hours;
	}

	$same = array_values( array_filter( array_merge( wp_list_pluck( (array) $o( 'socials' ), 'url' ), array( $o( 'gbp_url' ) ) ) ) );
	if ( $same ) {
		$node['sameAs'] = $same;
	}

	$visible = (bool) apply_filters( 'iim_core_rating_visible', false );
	if ( $visible && $o( 'rating_show' ) && $o( 'rating_value' ) && (int) $o( 'rating_count' ) > 0 ) {
		$node['aggregateRating'] = array(
			'@type'       => 'AggregateRating',
			'ratingValue' => (string) $o( 'rating_value' ),
			'reviewCount' => (int) $o( 'rating_count' ),
			'bestRating'  => '5',
		);
	}

	return array_filter( $node, fn( $v ) => null !== $v && '' !== $v && array() !== $v );
}

/**
 * Service node for single service pages.
 */
function iim_core_schema_service() {
	if ( ! is_singular( 'service' ) ) {
		return null;
	}
	$id   = get_queried_object_id();
	$get  = fn( $k ) => function_exists( 'get_field' ) ? get_field( $k, $id ) : '';
	$node = array(
		'@type'       => 'Service',
		'@id'         => get_permalink( $id ) . '#service',
		'name'        => get_the_title( $id ),
		'serviceType' => $get( 'schema_type' ) ?: get_the_title( $id ),
		'url'         => get_permalink( $id ),
		'description' => $get( 'direct_answer' ) ?: get_the_excerpt( $id ),
		'provider'    => array( '@id' => iim_core_business_id() ),
		'areaServed'  => iim_core_area_served(),
	);

	// Prices only when they are visible on the page.
	$prices = array_filter( (array) $get( 'prices' ), fn( $r ) => ! empty( $r['name'] ) && '' !== ( $r['price_from'] ?? '' ) );
	if ( $prices && iim_core_get_option( 'show_prices' ) && $get( 'show_prices' ) ) {
		$node['offers'] = array_values(
			array_map(
				fn( $r ) => array(
					'@type'              => 'Offer',
					'name'               => $r['name'],
					'priceSpecification' => array(
						'@type'         => 'PriceSpecification',
						'minPrice'      => (float) $r['price_from'],
						'priceCurrency' => 'AED',
					),
				),
				$prices
			)
		);
	}
	return array_filter( $node );
}

/**
 * FAQPage node from the FAQ items the template renders (theme filter iim_core_page_faqs).
 */
function iim_core_schema_faq() {
	$faqs = (array) apply_filters( 'iim_core_page_faqs', array() );
	$faqs = array_filter( $faqs, fn( $f ) => ! empty( $f['question'] ) && ! empty( $f['answer'] ) );
	if ( ! $faqs ) {
		return null;
	}
	$url = is_front_page() ? home_url( '/' ) : get_permalink( get_queried_object_id() );
	return array(
		'@type'      => 'FAQPage',
		'@id'        => $url . '#faq',
		'mainEntity' => array_values(
			array_map(
				fn( $f ) => array(
					'@type'          => 'Question',
					'name'           => wp_strip_all_tags( $f['question'] ),
					'acceptedAnswer' => array( '@type' => 'Answer', 'text' => wp_strip_all_tags( $f['answer'] ) ),
				),
				$faqs
			)
		),
	);
}

/**
 * All nodes for the current request.
 */
function iim_core_schema_nodes() {
	if ( is_404() || is_search() ) {
		return array();
	}
	return array_filter(
		array(
			'IIMLocalBusiness' => iim_core_schema_business(),
			'IIMService'       => iim_core_schema_service(),
			'IIMFAQPage'       => iim_core_schema_faq(),
		)
	);
}

// Inject into Rank Math's graph.
add_filter(
	'rank_math/json_ld',
	function ( $data ) {
		return array_merge( (array) $data, iim_core_schema_nodes() );
	},
	99
);

// Standalone output when Rank Math is not active.
add_action(
	'wp_head',
	function () {
		if ( defined( 'RANK_MATH_VERSION' ) ) {
			return;
		}
		$nodes = array_values( iim_core_schema_nodes() );
		if ( $nodes ) {
			echo '<script type="application/ld+json">' . wp_json_encode( array( '@context' => 'https://schema.org', '@graph' => $nodes ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
		}
	},
	20
);
