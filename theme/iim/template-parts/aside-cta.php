<?php
/**
 * Sticky sidebar panel: book in 3 steps, pay after the service.
 *
 * Args: service_slug (string), heading (string).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_slug = $args['service_slug'] ?? '';
?>
<div class="sticky">
	<div class="panel panel--dark" data-track-zone="aside">
		<h2><?php echo esc_html( $args['heading'] ?? __( 'Book in three steps', 'iim' ) ); ?></h2>
		<ol class="amc-highlight__list">
			<li><?php echo iim_icon( 'message-circle' ); // phpcs:ignore ?><span><?php esc_html_e( 'Message us on WhatsApp or send the quote form.', 'iim' ); ?></span></li>
			<li><?php echo iim_icon( 'camera' ); // phpcs:ignore ?><span><?php esc_html_e( 'Share a photo or short video of the issue.', 'iim' ); ?></span></li>
			<li><?php echo iim_icon( 'calendar-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'Send your location and the date that suits you.', 'iim' ); ?></span></li>
		</ol>
		<p><strong><?php esc_html_e( 'You pay after the service.', 'iim' ); ?></strong></p>
		<a class="btn btn--primary btn--block" href="<?php echo esc_url( iim_quote_url( $iim_slug ) ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
		<?php if ( iim_wa_href() ) : ?>
			<a class="btn btn--whatsapp btn--block" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
		<?php endif; ?>
		<?php if ( iim_tel_href() ) : ?>
			<a class="btn btn--secondary btn--block" href="<?php echo esc_url( iim_tel_href() ); ?>"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( iim_phone_display() ); ?></a>
		<?php endif; ?>
	</div>
</div>
