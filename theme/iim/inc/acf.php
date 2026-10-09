<?php
/**
 * ACF integration for the theme. Field groups are registered in iim-core (so content survives a
 * theme change); the theme only needs ACF to be present and warns when it is not.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'admin_notices',
	function () {
		if ( function_exists( 'acf_add_local_field_group' ) && function_exists( 'iim_core_get_option' ) ) {
			return;
		}
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
		echo '<div class="notice notice-error"><p>' . esc_html__( 'The IIM theme needs the ACF Pro and IIM Core plugins to be active. Pages will show defaults until both are enabled.', 'iim' ) . '</p></div>';
	}
);

/**
 * Flexible-content body sections for the current post.
 *
 * @param int $post_id Post ID.
 * @return array
 */
function iim_sections( $post_id ) {
	$sections = iim_field( 'sections', $post_id, array() );
	return is_array( $sections ) ? $sections : array();
}

/**
 * FAQ repeater rows (question/answer) for a post.
 *
 * @param int $post_id Post ID.
 * @return array<int,array{question:string,answer:string}>
 */
function iim_post_faqs( $post_id ) {
	$rows = iim_field( 'faqs', $post_id, array() );
	if ( ! is_array( $rows ) ) {
		return array();
	}
	return array_values(
		array_filter(
			$rows,
			fn( $r ) => ! empty( $r['question'] ) && ! empty( $r['answer'] )
		)
	);
}

/**
 * FAQ posts (faq post type), optionally only those flagged for the home page or a topic.
 *
 * @param array $args { home: bool, topic: string, limit: int }.
 * @return array<int,array{question:string,answer:string}>
 */
function iim_faq_posts( $args = array() ) {
	if ( ! post_type_exists( 'faq' ) ) {
		return array();
	}
	$args  = wp_parse_args( $args, array( 'home' => false, 'topic' => '', 'limit' => 50 ) );
	$query = array(
		'post_type'      => 'faq',
		'posts_per_page' => $args['limit'],
		'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'ASC' ),
		'no_found_rows'  => true,
	);
	if ( $args['home'] ) {
		$query['meta_query'] = array( array( 'key' => 'show_on_home', 'value' => '1' ) ); // phpcs:ignore WordPress.DB.SlowDBQuery -- small table.
	}
	if ( $args['topic'] ) {
		$query['tax_query'] = array( array( 'taxonomy' => 'faq_topic', 'field' => 'slug', 'terms' => $args['topic'] ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
	}
	return array_map(
		fn( $p ) => array(
			'question' => get_the_title( $p ),
			'answer'   => apply_filters( 'the_content', $p->post_content ),
		),
		get_posts( $query )
	);
}

/**
 * Testimonials whose publication permission has been confirmed.
 *
 * @param int $limit Max items.
 * @return WP_Post[]
 */
function iim_testimonials( $limit = 6 ) {
	if ( ! post_type_exists( 'testimonial' ) ) {
		return array();
	}
	return get_posts(
		array(
			'post_type'      => 'testimonial',
			'posts_per_page' => $limit,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'no_found_rows'  => true,
			'meta_query'     => array( array( 'key' => 'permission_confirmed', 'value' => '1' ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
}
