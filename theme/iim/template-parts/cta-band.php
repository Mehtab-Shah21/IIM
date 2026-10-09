<?php
/**
 * Final call-to-action band.
 *
 * Args: heading, text.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_heading = $args['heading'] ?? '';
$iim_text    = $args['text'] ?? '';

if ( ! $iim_heading && is_singular() ) {
	$iim_heading = iim_field( 'cta_heading', get_queried_object_id() );
	$iim_text    = iim_field( 'cta_text', get_queried_object_id() );
}
$iim_heading = $iim_heading ?: __( 'Tell us what needs fixing', 'iim' );
$iim_text    = $iim_text ?: __( 'Send a photo or a short video on WhatsApp, or fill in the quote form. We confirm a visit time, do the work, and you pay after the job is done.', 'iim' );
?>
<section class="section" aria-labelledby="cta-band-title">
	<div class="container">
		<div class="cta-band" data-reveal data-track-zone="cta-band">
			<h2 id="cta-band-title"><?php echo esc_html( $iim_heading ); ?></h2>
			<p><?php echo esc_html( $iim_text ); ?></p>
			<div class="btn-row">
				<a class="btn btn--primary" href="<?php echo esc_url( iim_quote_url() ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
				<?php if ( iim_wa_href() ) : ?>
					<a class="btn btn--whatsapp" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
				<?php endif; ?>
				<?php if ( iim_tel_href() ) : ?>
					<a class="btn btn--secondary" href="<?php echo esc_url( iim_tel_href() ); ?>"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( iim_phone_display() ); ?></a>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
