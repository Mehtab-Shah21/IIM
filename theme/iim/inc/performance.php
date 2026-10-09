<?php
/**
 * Front-end weight removal: emoji, embeds, block styles where unused, jQuery, dashicons for visitors.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

// Emoji script and styles.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
add_filter( 'emoji_svg_url', '__return_false' );

// oEmbed discovery and host JS.
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );

// Head clutter.
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'feed_links_extra', 3 );
remove_action( 'wp_head', 'rest_output_link_wp_head' );
remove_action( 'template_redirect', 'rest_output_link_header', 11 );

// Core sitemaps: Rank Math owns /sitemap_index.xml.
add_filter( 'wp_sitemaps_enabled', '__return_false' );

add_action(
	'wp_enqueue_scripts',
	function () {
		// Embeds script.
		wp_deregister_script( 'wp-embed' );

		// jQuery is never used on the front end.
		if ( ! is_admin() && ! is_customize_preview() ) {
			wp_deregister_script( 'jquery' );
		}

		// Dashicons only for logged-in users (admin bar).
		if ( ! is_user_logged_in() ) {
			wp_dequeue_style( 'dashicons' );
		}

		// Global block styles only where blocks are actually used (guides and legal pages).
		$uses_blocks = is_singular() && has_blocks( get_queried_object_id() );
		if ( ! $uses_blocks ) {
			wp_dequeue_style( 'wp-block-library' );
			wp_dequeue_style( 'wp-block-library-theme' );
			wp_dequeue_style( 'global-styles' );
			wp_dequeue_style( 'classic-theme-styles' );
			wp_dequeue_style( 'core-block-supports' );
		}
	},
	100
);

// Inline per-block CSS loading only when a block is rendered.
add_filter( 'should_load_separate_core_block_assets', '__return_true' );

// No heartbeat for visitors.
add_action(
	'init',
	function () {
		if ( ! is_admin() ) {
			wp_deregister_script( 'heartbeat' );
		}
	},
	1
);

// Do not let WordPress add its own image priority guesses; templates set fetchpriority on the LCP image only.
add_filter( 'wp_min_priority_img_pixels', fn() => PHP_INT_MAX );
