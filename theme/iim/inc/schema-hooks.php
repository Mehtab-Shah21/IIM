<?php
/**
 * Schema hooks. iim-core builds the JSON-LD (LocalBusiness, Service, FAQPage, AggregateRating) and
 * injects it into Rank Math's graph. The theme only tells it what this template visibly shows, so
 * the markup always matches the page: FAQ items rendered, and whether the rating is on screen.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

/**
 * FAQ items that the current template renders.
 */
add_filter(
	'iim_core_page_faqs',
	function ( $faqs ) {
		if ( is_front_page() ) {
			return iim_faq_posts( array( 'home' => true, 'limit' => 8 ) );
		}
		if ( is_page_template( 'templates/page-faq.php' ) ) {
			return iim_faq_posts();
		}
		if ( is_singular() ) {
			return iim_post_faqs( get_queried_object_id() );
		}
		return $faqs;
	}
);

/**
 * AggregateRating is only allowed where the rating and reviews are visible on the page.
 */
add_filter(
	'iim_core_rating_visible',
	function () {
		return is_front_page() || is_page_template( 'templates/page-reviews.php' );
	}
);
