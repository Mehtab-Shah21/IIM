<?php
/**
 * Emails: instant owner alert, customer confirmation, and an alert when webhook delivery fails.
 * Sent through wp_mail, which FluentSMTP routes over authenticated SMTP (SPF, DKIM, DMARC set on the domain).
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Plain-text summary of a lead.
 *
 * @param array $p Payload from iim_core_lead_payload().
 */
function iim_core_lead_text( $p ) {
	$rows = array(
		__( 'Reference', 'iim-core' )      => $p['reference'],
		__( 'Request', 'iim-core' )        => $p['service_label'] . ( $p['plan'] ? ' (' . $p['plan'] . ')' : '' ),
		__( 'Name', 'iim-core' )           => $p['name'],
		__( 'Phone', 'iim-core' )          => $p['phone'],
		__( 'Email', 'iim-core' )          => $p['email'],
		__( 'Location', 'iim-core' )       => trim( $p['location'] . ( $p['emirate'] ? ', ' . $p['emirate'] : '' ) ),
		__( 'Property', 'iim-core' )       => $p['property_type'],
		__( 'Preferred date', 'iim-core' ) => $p['preferred_date'],
		__( 'Preferred time', 'iim-core' ) => $p['preferred_time'],
		__( 'Photos', 'iim-core' )         => $p['photos'] ? (string) $p['photos'] : '',
	);
	$out = '';
	foreach ( $rows as $label => $value ) {
		if ( '' !== (string) $value ) {
			$out .= $label . ': ' . $value . "\n";
		}
	}
	if ( $p['issue'] ) {
		$out .= "\n" . __( 'Details', 'iim-core' ) . ":\n" . $p['issue'] . "\n";
	}
	return $out;
}

/**
 * Owner alert.
 *
 * @param int $lead_id Lead.
 */
function iim_core_mail_owner( $lead_id ) {
	$p       = iim_core_lead_payload( $lead_id );
	/* translators: 1: reference, 2: service, 3: name. */
	$subject = sprintf( __( 'New request %1$s: %2$s from %3$s', 'iim-core' ), $p['reference'], $p['service_label'], $p['name'] );
	$body    = iim_core_lead_text( $p );
	$body   .= "\n" . __( 'Reply on WhatsApp:', 'iim-core' ) . ' ' . $p['whatsapp_link'] . "\n";
	$body   .= __( 'Open in WordPress:', 'iim-core' ) . ' ' . $p['admin_url'] . "\n";
	if ( $p['flags'] ) {
		$body .= "\n" . __( 'Spam-check notes:', 'iim-core' ) . ' ' . implode( ', ', $p['flags'] ) . "\n";
	}
	$headers = array();
	if ( $p['email'] ) {
		$headers[] = 'Reply-To: ' . $p['name'] . ' <' . $p['email'] . '>';
	}
	return wp_mail( iim_core_owner_emails(), $subject, $body, $headers );
}

/**
 * Customer confirmation (only when an email was given).
 *
 * @param int $lead_id Lead.
 */
function iim_core_mail_customer( $lead_id ) {
	$p = iim_core_lead_payload( $lead_id );
	if ( ! $p['email'] ) {
		return false;
	}
	$business = (string) iim_core_get_option( 'business_name' );
	/* translators: 1: business name, 2: reference. */
	$subject = sprintf( __( '%1$s: we received your request (%2$s)', 'iim-core' ), $business, $p['reference'] );

	/* translators: %s: customer first name. */
	$body  = sprintf( __( 'Hello %s,', 'iim-core' ), strtok( $p['name'], ' ' ) ) . "\n\n";
	$body .= __( 'Thank you for contacting us. We have your request and will contact you to confirm the visit. You pay after the service.', 'iim-core' ) . "\n\n";
	$body .= __( 'Your details:', 'iim-core' ) . "\n" . iim_core_lead_text( array_merge( $p, array( 'photos' => 0 ) ) ) . "\n";
	$wa    = preg_replace( '/\D/', '', (string) iim_core_get_option( 'whatsapp_e164' ) );
	if ( $wa ) {
		/* translators: %s: reference. */
		$msg   = sprintf( __( 'Hi IIM, my reference is %s.', 'iim-core' ), $p['reference'] );
		$body .= __( 'To send photos or change anything, message us on WhatsApp:', 'iim-core' ) . ' https://wa.me/' . $wa . '?text=' . rawurlencode( $msg ) . "\n";
	}
	$body .= "\n" . $business . "\n" . iim_core_get_option( 'phone_display' ) . "\n" . home_url( '/' ) . "\n\n";
	$body .= __( 'You received this email because you submitted a request on our website. We use your details only for this request, as described in our privacy policy:', 'iim-core' ) . ' ' . home_url( '/privacy-policy/' ) . "\n";

	$headers = array();
	$reply   = iim_core_get_option( 'email' );
	if ( $reply && is_email( $reply ) ) {
		$headers[] = 'Reply-To: ' . $business . ' <' . $reply . '>';
	}
	return wp_mail( $p['email'], $subject, $body, $headers );
}

/**
 * Alert when a lead could not be delivered to Make/n8n after all retries.
 *
 * @param int    $lead_id Lead.
 * @param string $error   Last error.
 */
function iim_core_mail_webhook_failed( $lead_id, $error ) {
	$p = iim_core_lead_payload( $lead_id );
	/* translators: %s: reference. */
	$subject = sprintf( __( 'Action needed: lead %s was not added to the Google Sheet', 'iim-core' ), $p['reference'] );
	$body    = __( 'The automation (Make/n8n) did not accept this lead after several attempts. It is saved in WordPress. Please contact the customer directly and check the automation.', 'iim-core' ) . "\n\n";
	$body   .= iim_core_lead_text( $p ) . "\n" . __( 'Last error:', 'iim-core' ) . ' ' . $error . "\n" . $p['admin_url'] . "\n";
	wp_mail( iim_core_owner_emails(), $subject, $body );
}
