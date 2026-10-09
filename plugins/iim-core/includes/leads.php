<?php
/**
 * Lead validation, storage (private "lead" posts as a safety net), references, no-JS form state,
 * retention purge, and the admin screens.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

// UAE numbers: optional +971 / 00971 / 0, then mobile 5[0,2,4,5,6,8]XXXXXXX or landline [2-4,6,7,9]XXXXXXX.
const IIM_CORE_UAE_PHONE = '/^(?:\+971|00971|0)?(?:5[024568]\d{7}|[234679]\d{7})$/';

/**
 * Allowed choice values.
 */
function iim_core_choices() {
	return array(
		'property_type'  => array( 'apartment', 'villa', 'townhouse', 'office', 'retail', 'building', 'other' ),
		'preferred_time' => array( 'morning', 'afternoon', 'evening', 'any' ),
		'emirate'        => array( 'dubai', 'sharjah', 'abu-dhabi', 'ajman', 'umm-al-quwain', 'ras-al-khaimah', 'fujairah' ),
		'plan'           => array( '', 'residential', 'commercial' ),
	);
}

/**
 * Normalise a UAE phone number to +971XXXXXXXXX, or '' if invalid.
 *
 * @param string $raw Input.
 */
function iim_core_normalise_phone( $raw ) {
	$compact = preg_replace( '/[\s\-().]/', '', (string) $raw );
	if ( ! preg_match( IIM_CORE_UAE_PHONE, $compact ) ) {
		return '';
	}
	$digits = preg_replace( '/\D/', '', $compact );
	if ( 0 === strpos( $digits, '00971' ) ) {
		$digits = substr( $digits, 5 );
	} elseif ( 0 === strpos( $digits, '971' ) ) {
		$digits = substr( $digits, 3 );
	} elseif ( 0 === strpos( $digits, '0' ) ) {
		$digits = substr( $digits, 1 );
	}
	return '+971' . $digits;
}

/**
 * Validate and sanitise a submission.
 *
 * @param string $type   'quote' or 'amc'.
 * @param array  $params Raw request params.
 * @return array{0:array,1:array} [ clean values, errors keyed by field ].
 */
function iim_core_validate_lead( $type, $params ) {
	$clean   = array();
	$errors  = array();
	$choices = iim_core_choices();
	$req     = __( 'This field is required.', 'iim-core' );

	$text = function ( $key, $max ) use ( $params ) {
		return mb_substr( sanitize_text_field( wp_unslash( (string) ( $params[ $key ] ?? '' ) ) ), 0, $max );
	};

	$clean['name'] = $text( 'name', 100 );
	if ( '' === $clean['name'] ) {
		$errors['name'] = $req;
	}

	$clean['phone_raw'] = $text( 'phone', 20 );
	$clean['phone']     = iim_core_normalise_phone( $clean['phone_raw'] );
	if ( '' === $clean['phone'] ) {
		$errors['phone'] = '' === $clean['phone_raw'] ? $req : __( 'Enter a UAE number, for example 050 123 4567.', 'iim-core' );
	}

	$clean['location'] = $text( 'location', 200 );
	if ( '' === $clean['location'] ) {
		$errors['location'] = $req;
	}

	$clean['property_type'] = sanitize_key( (string) ( $params['property_type'] ?? '' ) );
	if ( '' !== $clean['property_type'] && ! in_array( $clean['property_type'], $choices['property_type'], true ) ) {
		$clean['property_type'] = '';
	}

	$clean['consent'] = '1' === (string) ( $params['consent'] ?? '' ) ? '1' : '';
	if ( '1' !== $clean['consent'] ) {
		$errors['consent'] = __( 'Please agree so we can contact you about this request.', 'iim-core' );
	}

	if ( 'amc' === $type ) {
		$clean['emirate'] = sanitize_key( (string) ( $params['emirate'] ?? '' ) );
		if ( ! in_array( $clean['emirate'], $choices['emirate'], true ) ) {
			$errors['emirate'] = $req;
		}
		if ( '' === $clean['property_type'] ) {
			$errors['property_type'] = $req;
		}
		$clean['plan'] = sanitize_key( (string) ( $params['plan'] ?? '' ) );
		if ( ! in_array( $clean['plan'], $choices['plan'], true ) ) {
			$clean['plan'] = '';
		}
		return array( $clean, $errors );
	}

	// Quote form.
	$service       = sanitize_title( (string) ( $params['service'] ?? '' ) );
	$valid_service = 'other' === $service || ( $service && get_page_by_path( $service, OBJECT, 'service' ) );
	if ( ! $valid_service ) {
		$errors['service'] = __( 'Please choose a service.', 'iim-core' );
	}
	$clean['service'] = $service;

	$clean['issue'] = mb_substr( sanitize_textarea_field( wp_unslash( (string) ( $params['issue'] ?? '' ) ) ), 0, 2000 );
	if ( '' === trim( $clean['issue'] ) ) {
		$errors['issue'] = $req;
	}

	$date  = sanitize_text_field( (string) ( $params['preferred_date'] ?? '' ) );
	$valid = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) && wp_checkdate( (int) substr( $date, 5, 2 ), (int) substr( $date, 8, 2 ), (int) substr( $date, 0, 4 ), $date );
	if ( ! $valid ) {
		$errors['preferred_date'] = $req;
	} elseif ( $date < wp_date( 'Y-m-d' ) ) {
		$errors['preferred_date'] = __( 'Choose today or a later date.', 'iim-core' );
	}
	$clean['preferred_date'] = $valid ? $date : '';

	$clean['preferred_time'] = sanitize_key( (string) ( $params['preferred_time'] ?? 'any' ) );
	if ( ! in_array( $clean['preferred_time'], $choices['preferred_time'], true ) ) {
		$clean['preferred_time'] = 'any';
	}

	$email = sanitize_email( (string) ( $params['email'] ?? '' ) );
	if ( '' !== trim( (string) ( $params['email'] ?? '' ) ) && ! is_email( $email ) ) {
		$errors['email'] = __( 'Enter a valid email address, or leave it empty.', 'iim-core' );
	}
	$clean['email'] = is_email( $email ) ? $email : '';

	return array( $clean, $errors );
}

/**
 * Unique, human-friendly reference: IIM-YYMMDD-XXXX.
 */
function iim_core_new_reference() {
	$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	do {
		$code = '';
		for ( $i = 0; $i < 4; $i++ ) {
			$code .= $alphabet[ random_int( 0, strlen( $alphabet ) - 1 ) ];
		}
		$ref    = 'IIM-' . wp_date( 'ymd' ) . '-' . $code;
		$exists = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'meta_key'       => '_iim_ref', // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'     => $ref, // phpcs:ignore WordPress.DB.SlowDBQuery
				'fields'         => 'ids',
				'posts_per_page' => 1,
			)
		);
	} while ( $exists );
	return $ref;
}

/**
 * Human label for a service slug.
 *
 * @param string $slug Slug.
 */
function iim_core_service_label( $slug ) {
	if ( 'other' === $slug ) {
		return __( 'Something else', 'iim-core' );
	}
	$post = $slug ? get_page_by_path( $slug, OBJECT, 'service' ) : null;
	return $post ? get_the_title( $post ) : (string) $slug;
}

/**
 * Save the private lead record. This happens before any delivery, so nothing is ever lost.
 *
 * @param string $type  Form type.
 * @param array  $data  Clean values.
 * @param array  $files Stored file names.
 * @param array  $flags Spam-check flags.
 * @param string $ref   Reference.
 * @param string $page  Page URL the form was sent from.
 * @return int|WP_Error Lead ID.
 */
function iim_core_save_lead( $type, $data, $files, $flags, $ref, $page ) {
	$label = 'amc' === $type ? __( 'Annual contract', 'iim-core' ) . ( $data['plan'] ? ' (' . $data['plan'] . ')' : '' ) : iim_core_service_label( $data['service'] );

	$id = wp_insert_post(
		array(
			'post_type'   => 'lead',
			'post_status' => 'private',
			'post_title'  => sprintf( '%s · %s · %s', $ref, $data['name'], $label ),
		),
		true
	);
	if ( is_wp_error( $id ) ) {
		return $id;
	}

	update_post_meta( $id, '_iim_ref', $ref );
	update_post_meta( $id, '_iim_type', $type );
	update_post_meta( $id, '_iim_data', $data );
	update_post_meta( $id, '_iim_files', $files );
	update_post_meta( $id, '_iim_flags', $flags );
	update_post_meta( $id, '_iim_page_url', esc_url_raw( $page ) );
	update_post_meta( $id, '_iim_consent_at', gmdate( 'c' ) );
	update_post_meta( $id, '_iim_webhook_status', 'pending' );
	update_post_meta( $id, '_iim_webhook_attempts', 0 );

	return $id;
}

/**
 * Lead as a flat array for the webhook, emails and the admin view.
 *
 * @param int $lead_id Lead.
 */
function iim_core_lead_payload( $lead_id ) {
	$data  = (array) get_post_meta( $lead_id, '_iim_data', true );
	$type  = get_post_meta( $lead_id, '_iim_type', true );
	$files = (array) get_post_meta( $lead_id, '_iim_files', true );
	$links = array();
	foreach ( array_keys( $files ) as $i ) {
		$links[] = iim_core_lead_file_url( $lead_id, $i ); // Login required to open.
	}
	return array(
		'reference'      => get_post_meta( $lead_id, '_iim_ref', true ),
		'form'           => $type,
		'submitted_at'   => get_post_time( 'c', true, $lead_id ),
		'name'           => $data['name'] ?? '',
		'phone'          => $data['phone'] ?? '',
		'email'          => $data['email'] ?? '',
		'service'        => 'amc' === $type ? 'annual-contract' : ( $data['service'] ?? '' ),
		'service_label'  => 'amc' === $type ? __( 'Annual contract', 'iim-core' ) : iim_core_service_label( $data['service'] ?? '' ),
		'plan'           => $data['plan'] ?? '',
		'issue'          => $data['issue'] ?? '',
		'location'       => $data['location'] ?? '',
		'emirate'        => $data['emirate'] ?? ( 'quote' === $type ? 'dubai' : '' ),
		'property_type'  => $data['property_type'] ?? '',
		'preferred_date' => $data['preferred_date'] ?? '',
		'preferred_time' => $data['preferred_time'] ?? '',
		'photos'         => count( $files ),
		'photo_links'    => $links,
		'flags'          => (array) get_post_meta( $lead_id, '_iim_flags', true ),
		'page_url'       => get_post_meta( $lead_id, '_iim_page_url', true ),
		'admin_url'      => admin_url( 'post.php?post=' . (int) $lead_id . '&action=edit' ),
		'whatsapp_link'  => 'https://wa.me/' . preg_replace( '/\D/', '', (string) ( $data['phone'] ?? '' ) ),
	);
}

/*
 * ---------- No-JS form state (errors and old values after a redirect) ----------
 */

/**
 * Store state for the next page view and return its key.
 *
 * @param string $type   Form type.
 * @param array  $values Values (no files).
 * @param array  $errors Errors.
 * @param string $message Message.
 */
function iim_core_store_form_state( $type, $values, $errors, $message ) {
	$key = wp_generate_password( 20, false, false );
	unset( $values['phone'] );
	if ( isset( $values['phone_raw'] ) ) {
		$values['phone'] = $values['phone_raw'];
	}
	set_transient( 'iim_fs_' . $key, compact( 'type', 'values', 'errors', 'message' ), 10 * MINUTE_IN_SECONDS );
	return $key;
}

/**
 * Read (once) the state for a form on this page view.
 *
 * @param string $type Form type.
 * @return array{values?:array,errors?:array,message?:string}
 */
function iim_core_form_state( $type ) {
	static $read = array();
	$key = isset( $_GET['iim_form'] ) ? preg_replace( '/[^A-Za-z0-9]/', '', (string) wp_unslash( $_GET['iim_form'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if ( ! $key ) {
		return array();
	}
	if ( ! array_key_exists( $key, $read ) ) {
		$read[ $key ] = get_transient( 'iim_fs_' . $key );
		delete_transient( 'iim_fs_' . $key );
	}
	$state = $read[ $key ];
	return ( is_array( $state ) && ( $state['type'] ?? '' ) === $type ) ? $state : array();
}

// Never cache a page that shows form state.
add_action(
	'template_redirect',
	function () {
		if ( isset( $_GET['iim_form'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( ! defined( 'DONOTCACHEPAGE' ) ) {
				define( 'DONOTCACHEPAGE', true );
			}
			do_action( 'litespeed_control_set_nocache', 'iim form state' );
			nocache_headers();
		}
	},
	1
);

/*
 * ---------- Retention ----------
 */

/**
 * Schedule daily jobs.
 */
function iim_core_schedule_events() {
	if ( ! wp_next_scheduled( 'iim_core_purge_old_leads' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'iim_core_purge_old_leads' );
	}
	if ( ! wp_next_scheduled( 'iim_core_retry_webhooks' ) ) {
		wp_schedule_event( time() + 300, 'iim_five_minutes', 'iim_core_retry_webhooks' );
	}
}
add_action( 'init', 'iim_core_schedule_events' );

add_filter(
	'cron_schedules',
	function ( $schedules ) {
		$schedules['iim_five_minutes'] = array(
			'interval' => 300,
			'display'  => __( 'Every five minutes', 'iim-core' ),
		);
		return $schedules;
	}
);

/**
 * Delete leads (and their photos) older than the retention period in Business Info.
 */
add_action(
	'iim_core_purge_old_leads',
	function () {
		$months = max( 1, (int) iim_core_get_option( 'data_retention_months' ) );
		$ids    = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => 200,
				'date_query'     => array( array( 'before' => gmdate( 'Y-m-d H:i:s', strtotime( "-{$months} months" ) ), 'column' => 'post_date_gmt' ) ),
			)
		);
		foreach ( $ids as $id ) {
			wp_delete_post( $id, true );
		}
	}
);
