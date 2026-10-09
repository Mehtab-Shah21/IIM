<?php
/**
 * Custom post types: service, area, project, testimonial, faq, guide, and the private lead log.
 *
 * URLs: /services/{slug}/, /areas/{slug}/, /projects/{slug}/, /guides/{slug}/.
 * Hubs are the post type archives at /services/, /areas/, /projects/, /guides/.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Labels helper.
 *
 * @param string $singular Singular.
 * @param string $plural   Plural.
 */
function iim_core_labels( $singular, $plural ) {
	return array(
		'name'               => $plural,
		'singular_name'      => $singular,
		/* translators: %s: item name. */
		'add_new_item'       => sprintf( __( 'Add new %s', 'iim-core' ), $singular ),
		/* translators: %s: item name. */
		'edit_item'          => sprintf( __( 'Edit %s', 'iim-core' ), $singular ),
		/* translators: %s: item name. */
		'new_item'           => sprintf( __( 'New %s', 'iim-core' ), $singular ),
		/* translators: %s: item name. */
		'view_item'          => sprintf( __( 'View %s', 'iim-core' ), $singular ),
		/* translators: %s: items name. */
		'search_items'       => sprintf( __( 'Search %s', 'iim-core' ), $plural ),
		/* translators: %s: items name. */
		'not_found'          => sprintf( __( 'No %s found', 'iim-core' ), strtolower( $plural ) ),
		/* translators: %s: items name. */
		'all_items'          => sprintf( __( 'All %s', 'iim-core' ), $plural ),
		'menu_name'          => $plural,
	);
}

/**
 * Register everything. Also called on activation before flushing rewrites.
 */
function iim_core_register_post_types() {
	$public = array(
		'public'             => true,
		'show_in_rest'       => true,
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => 5,
		'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'revisions' ),
		'capability_type'    => 'post',
		'map_meta_cap'       => true,
	);

	register_post_type(
		'service',
		array_merge(
			$public,
			array(
				'labels'    => iim_core_labels( __( 'Service', 'iim-core' ), __( 'Services', 'iim-core' ) ),
				'menu_icon' => 'dashicons-hammer',
				'rewrite'   => array( 'slug' => 'services', 'with_front' => false ),
				'supports'  => array( 'title', 'excerpt', 'thumbnail', 'page-attributes', 'revisions' ),
			)
		)
	);

	register_post_type(
		'area',
		array_merge(
			$public,
			array(
				'labels'    => iim_core_labels( __( 'Area', 'iim-core' ), __( 'Areas', 'iim-core' ) ),
				'menu_icon' => 'dashicons-location',
				'rewrite'   => array( 'slug' => 'areas', 'with_front' => false ),
				'supports'  => array( 'title', 'excerpt', 'page-attributes', 'revisions' ),
			)
		)
	);

	register_post_type(
		'project',
		array_merge(
			$public,
			array(
				'labels'    => iim_core_labels( __( 'Project', 'iim-core' ), __( 'Projects', 'iim-core' ) ),
				'menu_icon' => 'dashicons-format-gallery',
				'rewrite'   => array( 'slug' => 'projects', 'with_front' => false ),
			)
		)
	);

	register_post_type(
		'guide',
		array_merge(
			$public,
			array(
				'labels'    => iim_core_labels( __( 'Guide', 'iim-core' ), __( 'Guides', 'iim-core' ) ),
				'menu_icon' => 'dashicons-book-alt',
				'rewrite'   => array( 'slug' => 'guides', 'with_front' => false ),
				'supports'  => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author' ),
			)
		)
	);

	// Testimonials and FAQs are shown on pages, never as their own URLs (no thin pages).
	$embedded = array(
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		'show_in_rest'        => true,
		'has_archive'         => false,
		'rewrite'             => false,
		'menu_position'       => 6,
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
	);

	register_post_type(
		'testimonial',
		array_merge(
			$embedded,
			array(
				'labels'    => iim_core_labels( __( 'Testimonial', 'iim-core' ), __( 'Testimonials', 'iim-core' ) ),
				'menu_icon' => 'dashicons-format-quote',
				'supports'  => array( 'title', 'editor', 'page-attributes' ),
			)
		)
	);

	register_post_type(
		'faq',
		array_merge(
			$embedded,
			array(
				'labels'    => iim_core_labels( __( 'FAQ', 'iim-core' ), __( 'FAQs', 'iim-core' ) ),
				'menu_icon' => 'dashicons-editor-help',
				'supports'  => array( 'title', 'editor', 'page-attributes' ),
			)
		)
	);

	register_taxonomy(
		'faq_topic',
		array( 'faq' ),
		array(
			'labels'            => array(
				'name'          => __( 'FAQ topics', 'iim-core' ),
				'singular_name' => __( 'FAQ topic', 'iim-core' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'hierarchical'      => true,
			'rewrite'           => false,
		)
	);

	// Private lead log: backup of every form submission. Admins and editors only.
	register_post_type(
		'lead',
		array(
			'labels'              => iim_core_labels( __( 'Lead', 'iim-core' ), __( 'Leads', 'iim-core' ) ),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'menu_position'       => 2,
			'menu_icon'           => 'dashicons-email-alt',
			'supports'            => array( 'title' ),
			'rewrite'             => false,
			'query_var'           => false,
			'capability_type'     => array( 'iim_lead', 'iim_leads' ),
			'map_meta_cap'        => true,
			'capabilities'        => array( 'create_posts' => 'do_not_allow' ),
		)
	);
}
add_action( 'init', 'iim_core_register_post_types', 5 );
