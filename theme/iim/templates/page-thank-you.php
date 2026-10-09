<?php
/**
 * Template Name: Thank you (noindex)
 *
 * Shows the reference number and a WhatsApp button prefilled with it.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

// Reference format: IIM-YYMMDD-XXXX (validated, never echoed raw).
$iim_ref = isset( $_GET['ref'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_GET['ref'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
if ( ! preg_match( '/^IIM-\d{6}-[A-Z0-9]{4}$/', $iim_ref ) ) {
	$iim_ref = '';
}

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title' => __( 'Thank you, we have your request', 'iim' ),
		'lead'  => $iim_ref
			/* translators: %s: reference number. */
			? sprintf( __( 'Your reference number is %s. We will contact you to confirm the visit.', 'iim' ), $iim_ref )
			: __( 'We will contact you to confirm the visit.', 'iim' ),
	)
);

$iim_msg = $iim_ref
	/* translators: %s: reference number. */
	? sprintf( __( 'Hi IIM, I just sent a quote request. My reference is %s.', 'iim' ), $iim_ref )
	: __( 'Hi IIM, I just sent a quote request on your website.', 'iim' );
?>
<section class="section">
	<div class="container">
		<div class="stack stack--lg measure">
			<div class="form-alert form-alert--success" role="status">
				<?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?>
				<span><?php esc_html_e( 'Your request was sent. A confirmation email is on its way if you gave us your email address.', 'iim' ); ?></span>
			</div>
			<h2><?php esc_html_e( 'Want to speed things up?', 'iim' ); ?></h2>
			<p class="lead"><?php esc_html_e( 'Send photos or a short video of the issue on WhatsApp. Your reference number is already in the message.', 'iim' ); ?></p>
			<div class="btn-row" data-track-zone="thank-you">
				<?php if ( iim_wa_href( $iim_msg ) ) : ?>
					<a class="btn btn--whatsapp" href="<?php echo esc_url( iim_wa_href( $iim_msg ) ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'Continue on WhatsApp', 'iim' ); ?></a>
				<?php endif; ?>
				<a class="btn btn--secondary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to the homepage', 'iim' ); ?></a>
			</div>
		</div>
	</div>
</section>
<?php
get_footer();
