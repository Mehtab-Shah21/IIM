<?php
/**
 * Theme supports, image sizes, menus, text domain.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	function () {
		load_theme_textdomain( 'iim', IIM_THEME_DIR . '/languages' );

		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
		add_theme_support(
			'custom-logo',
			array(
				'height'      => 96,
				'width'       => 320,
				'flex-width'  => true,
				'flex-height' => true,
			)
		);

		// Fixed aspect ratios from the design system.
		add_image_size( 'iim-card', 800, 500, true );      // 16/10 cards.
		add_image_size( 'iim-card-sm', 480, 300, true );   // 16/10 cards, small screens.
		add_image_size( 'iim-hero', 1200, 900, true );     // 4/3 hero media.
		add_image_size( 'iim-square', 600, 600, true );    // Before/after pairs.
		add_image_size( 'iim-wide', 1600, 1000, true );    // Large 16/10 media.
		add_image_size( 'iim-og', 1200, 630, true );       // Open Graph share image.

		register_nav_menus(
			array(
				'legal' => __( 'Footer legal links', 'iim' ),
			)
		);
	}
);

// Content width for embeds.
add_action(
	'after_setup_theme',
	function () {
		$GLOBALS['content_width'] = 800;
	},
	0
);

// Human names for our image sizes in the media picker.
add_filter(
	'image_size_names_choose',
	function ( $sizes ) {
		return array_merge(
			$sizes,
			array(
				'iim-card' => __( 'Card (16:10)', 'iim' ),
				'iim-wide' => __( 'Wide (16:10)', 'iim' ),
			)
		);
	}
);

// Keep the editor (block editor) for guides and legal pages only; structured types use ACF fields.
add_filter(
	'use_block_editor_for_post_type',
	function ( $use, $post_type ) {
		return in_array( $post_type, array( 'guide', 'post' ), true ) ? $use : false;
	},
	10,
	2
);
