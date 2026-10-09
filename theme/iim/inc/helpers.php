<?php
/**
 * Template helpers: fields, options, icons, links, images, placeholders.
 *
 * Every contact detail on the site reads from the Business Info options page through iim_opt(),
 * so there is exactly one source of truth.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read a Business Info option (ACF options page, defined in iim-core).
 *
 * @param string $key     Option name.
 * @param mixed  $default Fallback.
 * @return mixed
 */
function iim_opt( $key, $default = '' ) {
	if ( function_exists( 'iim_core_get_option' ) ) {
		$value = iim_core_get_option( $key );
		return ( null === $value || '' === $value || false === $value ) ? $default : $value;
	}
	return $default;
}

/**
 * Read an ACF field safely (works when ACF is inactive).
 *
 * @param string    $name    Field name.
 * @param int|false $post_id Post ID, false for current.
 * @param mixed     $default Fallback.
 * @return mixed
 */
function iim_field( $name, $post_id = false, $default = '' ) {
	if ( ! function_exists( 'get_field' ) ) {
		return $default;
	}
	$value = get_field( $name, $post_id );
	return ( null === $value || '' === $value || false === $value || array() === $value ) ? $default : $value;
}

/**
 * Inline SVG icon from the sprite.
 *
 * @param string $name  Icon name (see build.mjs).
 * @param string $class Extra classes.
 * @param string $label Accessible label; empty means decorative.
 * @return string
 */
function iim_icon( $name, $class = '', $label = '' ) {
	$attrs = $label
		? sprintf( 'role="img" aria-label="%s"', esc_attr( $label ) )
		: 'aria-hidden="true" focusable="false"';
	return sprintf(
		'<svg class="icon %1$s" %2$s><use href="#i-%3$s"></use></svg>',
		esc_attr( $class ),
		$attrs,
		esc_attr( $name )
	);
}

/**
 * Whether the current visitor can see editor-only placeholder notes.
 */
function iim_show_placeholders() {
	return is_user_logged_in() && current_user_can( 'edit_posts' );
}

/**
 * Editor-only placeholder marker. Visitors see nothing, so placeholders never leak to the public.
 * Every placeholder is listed in docs/placeholder-register.md.
 *
 * @param string $note What is missing.
 * @return string
 */
function iim_placeholder( $note ) {
	if ( ! iim_show_placeholders() ) {
		return '';
	}
	/* translators: %s: description of the missing content. */
	return '<span class="iim-placeholder">' . esc_html( sprintf( __( '[CONFIRM: %s]', 'iim' ), $note ) ) . '</span>';
}

/**
 * Digits only, for tel: and wa.me links.
 *
 * @param string $number Phone in any format.
 */
function iim_digits( $number ) {
	return preg_replace( '/\D+/', '', (string) $number );
}

/**
 * tel: href from the options page.
 */
function iim_tel_href() {
	$e164 = iim_opt( 'phone_e164' );
	return $e164 ? 'tel:+' . iim_digits( $e164 ) : '';
}

/**
 * Human-readable phone from the options page.
 */
function iim_phone_display() {
	return iim_opt( 'phone_display', iim_opt( 'phone_e164' ) );
}

/**
 * WhatsApp click-to-chat link with a prefilled message.
 *
 * @param string $message Message; defaults to the page-specific message.
 */
function iim_wa_href( $message = '' ) {
	$number = iim_digits( iim_opt( 'whatsapp_e164' ) );
	if ( ! $number ) {
		return '';
	}
	if ( '' === $message ) {
		$message = iim_wa_message();
	}
	return 'https://wa.me/' . $number . '?text=' . rawurlencode( $message );
}

/**
 * Page-specific WhatsApp message: field override, then a per-type default, then the global default.
 */
function iim_wa_message() {
	$default = iim_opt( 'default_whatsapp_message', __( 'Hi IIM, I would like to book a service in Dubai.', 'iim' ) );

	if ( is_singular() ) {
		$custom = iim_field( 'whatsapp_message', get_queried_object_id() );
		if ( $custom ) {
			return $custom;
		}
	}

	if ( is_singular( 'service' ) ) {
		$noun = iim_field( 'whatsapp_noun', get_queried_object_id(), get_the_title() );
		/* translators: %s: service, e.g. "an electrician". */
		return sprintf( __( 'Hi IIM, I need %s in Dubai.', 'iim' ), $noun );
	}

	if ( is_singular( 'area' ) ) {
		/* translators: %s: area name. */
		return sprintf( __( 'Hi IIM, I need a technician in %s.', 'iim' ), get_the_title() );
	}

	if ( is_page_template( 'templates/page-amc.php' ) || is_page_template( 'templates/page-amc-plan.php' ) ) {
		return __( 'Hi IIM, I would like to know more about your annual maintenance contract.', 'iim' );
	}

	return $default;
}

/**
 * Responsive image with srcset/sizes, explicit width/height and lazy loading by default.
 * Falls back to a neutral placeholder box when no image is set.
 *
 * @param int|array|null $image   Attachment ID or ACF image array.
 * @param string         $size    Registered size.
 * @param string         $sizes   sizes attribute.
 * @param array          $attrs   Extra attributes (loading, fetchpriority, class, alt).
 * @param string         $missing Placeholder label for editors.
 * @return string
 */
function iim_img( $image, $size = 'iim-card', $sizes = '100vw', $attrs = array(), $missing = '' ) {
	$id = is_array( $image ) ? ( $image['ID'] ?? 0 ) : (int) $image;

	if ( ! $id ) {
		$label = $missing && iim_show_placeholders()
			/* translators: %s: which photo is needed. */
			? esc_html( sprintf( __( 'Photo needed: %s', 'iim' ), $missing ) )
			: '';
		return '<div class="ph-media" aria-hidden="true">' . $label . '</div>';
	}

	$attrs = wp_parse_args(
		$attrs,
		array(
			'loading'  => 'lazy',
			'decoding' => 'async',
			'sizes'    => $sizes,
		)
	);

	if ( isset( $attrs['fetchpriority'] ) && 'high' === $attrs['fetchpriority'] ) {
		$attrs['loading'] = 'eager';
	}

	return wp_get_attachment_image( $id, $size, false, $attrs );
}

/**
 * URL of a page by path, or empty string if it does not exist yet.
 *
 * @param string $path Page path, e.g. 'get-a-quote'.
 */
function iim_page_url( $path ) {
	static $cache = array();
	if ( ! isset( $cache[ $path ] ) ) {
		$page            = get_page_by_path( $path );
		$cache[ $path ] = $page ? get_permalink( $page ) : home_url( '/' . trim( $path, '/' ) . '/' );
	}
	return $cache[ $path ];
}

/**
 * Quote page URL, optionally preselecting a service.
 *
 * @param string $service Service slug.
 */
function iim_quote_url( $service = '' ) {
	$url = iim_page_url( 'get-a-quote' );
	return $service ? add_query_arg( 'service', rawurlencode( $service ), $url ) : $url;
}

/**
 * Services for menus, cards and forms, ordered by menu order.
 *
 * @return WP_Post[]
 */
function iim_services() {
	static $services = null;
	if ( null === $services ) {
		$services = post_type_exists( 'service' ) ? get_posts(
			array(
				'post_type'        => 'service',
				'posts_per_page'   => 20,
				'orderby'          => array(
					'menu_order' => 'ASC',
					'title'      => 'ASC',
				),
				'no_found_rows'    => true,
				'suppress_filters' => false,
			)
		) : array();
	}
	return $services;
}

/**
 * Icon name for a service (ACF select), with a safe default.
 *
 * @param int $post_id Service ID.
 */
function iim_service_icon( $post_id ) {
	return iim_field( 'icon', $post_id, 'wrench' );
}

/**
 * Word count helper for the direct-answer summary (40 to 60 words).
 *
 * @param string $text Text.
 */
function iim_word_count( $text ) {
	return str_word_count( wp_strip_all_tags( (string) $text ) );
}

/**
 * Allowed HTML for short rich-text fields.
 */
function iim_kses_inline() {
	return array(
		'a'      => array(
			'href'   => true,
			'title'  => true,
			'target' => true,
			'rel'    => true,
		),
		'strong' => array(),
		'em'     => array(),
		'br'     => array(),
	);
}

/**
 * One-line address from the options page (iim-core), with a safe fallback.
 */
function iim_address_line() {
	return function_exists( 'iim_core_address_line' ) ? iim_core_address_line() : __( 'Dubai, United Arab Emirates', 'iim' );
}
