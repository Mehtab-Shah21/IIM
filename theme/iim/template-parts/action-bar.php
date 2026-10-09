<?php
/**
 * Mobile action bar (Call, WhatsApp, Get a Quote) and desktop floating WhatsApp button.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_wa  = iim_wa_href();
$iim_tel = iim_tel_href();

if ( is_page_template( 'templates/page-thank-you.php' ) ) {
	return; // The thank-you page has its own WhatsApp button with the reference number.
}
?>
<nav class="action-bar" aria-label="<?php esc_attr_e( 'Quick actions', 'iim' ); ?>" data-track-zone="action-bar">
	<?php if ( $iim_tel ) : ?>
		<a class="btn btn--secondary" href="<?php echo esc_url( $iim_tel ); ?>"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php esc_html_e( 'Call', 'iim' ); ?></a>
	<?php endif; ?>
	<?php if ( $iim_wa ) : ?>
		<a class="btn btn--whatsapp" href="<?php echo esc_url( $iim_wa ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp', 'iim' ); ?></a>
	<?php endif; ?>
	<a class="btn btn--primary" href="<?php echo esc_url( iim_quote_url() ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
</nav>

<?php if ( $iim_wa ) : ?>
	<a class="wa-float" href="<?php echo esc_url( $iim_wa ); ?>" target="_blank" rel="noopener" data-track="float">
		<?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?>
		<span><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></span>
	</a>
<?php endif; ?>
