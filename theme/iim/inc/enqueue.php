<?php
/**
 * Assets: inlined critical CSS, preloaded self-hosted fonts, async main CSS, deferred ES module,
 * inline SVG sprite, LCP image preload.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

/**
 * URL and version of a built asset.
 *
 * @param string $rel Path relative to assets/dist.
 * @return array{0:string,1:string|false}
 */
function iim_asset( $rel ) {
	$path = IIM_THEME_DIR . '/assets/dist/' . $rel;
	return array( IIM_THEME_URI . '/assets/dist/' . $rel, file_exists( $path ) ? (string) filemtime( $path ) : IIM_THEME_VERSION );
}

/**
 * Font preloads, @font-face with size-adjusted fallbacks (no layout shift on swap), critical CSS.
 */
add_action(
	'wp_head',
	function () {
		$fonts = array(
			'inter'             => iim_asset( 'fonts/inter-latin-wght.woff2' )[0],
			'plus-jakarta-sans' => iim_asset( 'fonts/plus-jakarta-sans-latin-wght.woff2' )[0],
		);

		foreach ( $fonts as $url ) {
			printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( $url ) );
		}

		$critical_path = IIM_THEME_DIR . '/assets/dist/css/critical.css';
		$critical      = file_exists( $critical_path ) ? file_get_contents( $critical_path ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local theme file.

		// Fallback metrics tuned for Arial; re-check with Capsize/Fontaine if the fonts change.
		$font_css = sprintf(
			'@font-face{font-family:"Inter";src:url(%1$s) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}' .
			'@font-face{font-family:"Plus Jakarta Sans";src:url(%2$s) format("woff2");font-weight:200 800;font-style:normal;font-display:swap}' .
			'@font-face{font-family:"Inter Fallback";src:local("Arial");ascent-override:90.44%%;descent-override:22.52%%;line-gap-override:0%%;size-adjust:107.12%%}' .
			'@font-face{font-family:"Plus Jakarta Sans Fallback";src:local("Arial");ascent-override:98.88%%;descent-override:21.12%%;line-gap-override:0%%;size-adjust:104.98%%}',
			esc_url( $fonts['inter'] ),
			esc_url( $fonts['plus-jakarta-sans'] )
		);

		echo '<style id="iim-critical">' . $font_css . $critical . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built CSS from the theme.

		// Non-critical CSS without blocking render. The onload handler is allowed by a CSP hash (see server/security-headers.conf).
		list( $main_url, $main_ver ) = iim_asset( 'css/main.css' );
		$href                        = esc_url( add_query_arg( 'ver', $main_ver, $main_url ) );
		printf( '<link rel="stylesheet" id="iim-main-css" href="%1$s" media="print" onload="this.media=\'all\'">' . "\n", $href ); // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedStylesheet
		printf( '<noscript><link rel="stylesheet" href="%1$s"></noscript>' . "\n", $href ); // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedStylesheet
	},
	2
);

/**
 * Main ES module (deferred by nature, no render blocking, no jQuery).
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		list( $url, $ver ) = iim_asset( 'js/main.js' );
		wp_enqueue_script_module( 'iim-main', $url, array(), $ver );
	}
);

/**
 * Inline SVG sprite right after <body>.
 */
add_action(
	'wp_body_open',
	function () {
		$sprite = IIM_THEME_DIR . '/assets/dist/icons/sprite.svg';
		if ( file_exists( $sprite ) ) {
			echo file_get_contents( $sprite ); // phpcs:ignore -- trusted, build-generated SVG.
		}
	},
	1
);

/**
 * Preload the LCP image. Call before get_header() from a template that shows a hero image.
 *
 * @param int    $attachment_id Image ID.
 * @param string $size          Image size.
 * @param string $sizes         sizes attribute (must match the <img>).
 */
function iim_preload_image( $attachment_id, $size, $sizes ) {
	if ( ! $attachment_id ) {
		return;
	}
	add_action(
		'wp_head',
		function () use ( $attachment_id, $size, $sizes ) {
			$src    = wp_get_attachment_image_url( $attachment_id, $size );
			$srcset = wp_get_attachment_image_srcset( $attachment_id, $size );
			if ( ! $src ) {
				return;
			}
			printf(
				'<link rel="preload" as="image" href="%1$s"%2$s imagesizes="%3$s" fetchpriority="high">' . "\n",
				esc_url( $src ),
				$srcset ? ' imagesrcset="' . esc_attr( $srcset ) . '"' : '',
				esc_attr( $sizes )
			);
		},
		1
	);
}

/**
 * Admin-side styles for the lead screen.
 */
add_action(
	'admin_enqueue_scripts',
	function () {
		list( $url, $ver ) = iim_asset( 'css/admin.css' );
		wp_enqueue_style( 'iim-admin', $url, array(), $ver );
	}
);
