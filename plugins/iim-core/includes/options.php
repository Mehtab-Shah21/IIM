<?php
/**
 * Business Info: the single source of truth for contact details, trust claims and site-wide copy.
 * Stored on an ACF options page (fields in fields.php). Defaults are the details found on the
 * old site and must be confirmed (see docs/placeholder-register.md).
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Fallback values used until Business Info is saved. Only details already public on the old site.
 */
function iim_core_defaults() {
	return array(
		'business_name'            => 'IIM Technical Services',
		'legal_name'               => 'IIM Technical Services L.L.C.',
		'phone_e164'               => '+971509626446', // [CONFIRM] old footer showed +971 50 904 4115 but dialled this number.
		'phone_display'            => '+971 50 962 6446',
		'whatsapp_e164'            => '+971509626446',
		'email'                    => 'iim@iimtechnicalservices.com', // [CONFIRM] old contact page showed info@iimuae.com.
		'address_locality'         => 'Dubai',
		'address_region'           => 'Dubai',
		'address_country'          => 'AE',
		'default_whatsapp_message' => __( 'Hi IIM, I would like to book a service in Dubai.', 'iim-core' ),
		'show_prices'              => false,
		'data_retention_months'    => 24, // [CONFIRM] retention period.
	);
}

/**
 * Read one Business Info value.
 *
 * @param string $key Field name.
 * @return mixed|null
 */
function iim_core_get_option( $key ) {
	static $cache = array();
	if ( array_key_exists( $key, $cache ) ) {
		return $cache[ $key ];
	}
	$value = function_exists( 'get_field' ) ? get_field( $key, 'option' ) : null;
	if ( null === $value || '' === $value || array() === $value ) {
		$defaults = iim_core_defaults();
		$value    = $defaults[ $key ] ?? null;
	}
	$cache[ $key ] = $value;
	return $value;
}

/**
 * Address on one line, e.g. "Deira, Dubai, United Arab Emirates".
 */
function iim_core_address_line() {
	$parts = array_filter(
		array(
			iim_core_get_option( 'address_street' ),
			iim_core_get_option( 'address_locality' ),
			'AE' === iim_core_get_option( 'address_country' ) ? __( 'United Arab Emirates', 'iim-core' ) : iim_core_get_option( 'address_country' ),
		)
	);
	return implode( ', ', array_unique( $parts ) );
}

/**
 * Owner notification recipients (comma separated in Business Info), falling back to admin email.
 *
 * @return string[]
 */
function iim_core_owner_emails() {
	$raw    = (string) iim_core_get_option( 'owner_email' );
	$emails = array_filter( array_map( 'sanitize_email', array_map( 'trim', explode( ',', $raw ) ) ), 'is_email' );
	return $emails ?: array( get_option( 'admin_email' ) );
}

/**
 * Register the Business Info options page.
 */
add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_options_page' ) ) {
			return;
		}
		acf_add_options_page(
			array(
				'page_title' => __( 'Business Info', 'iim-core' ),
				'menu_title' => __( 'Business Info', 'iim-core' ),
				'menu_slug'  => 'iim-business-info',
				'capability' => 'iim_manage_business_info',
				'icon_url'   => 'dashicons-store',
				'position'   => 3,
				'redirect'   => false,
				'autoload'   => true,
			)
		);
	}
);
