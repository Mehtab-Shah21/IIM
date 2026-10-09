<?php
/**
 * Trust strip: only claims that are switched on (and therefore confirmed) in Business Info.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_items = array();

if ( iim_opt( 'claim_247' ) ) {
	$iim_items[] = array( 'clock', __( '24/7 emergency help', 'iim' ) );
}
if ( iim_opt( 'dewa_show' ) ) {
	$iim_items[] = array( 'shield-check', iim_opt( 'dewa_short', __( 'DEWA-compliant work', 'iim' ) ) );
}
$iim_items[] = array( 'wallet', __( 'Pay after the service', 'iim' ) );
if ( iim_opt( 'rating_show' ) && iim_opt( 'rating_value' ) ) {
	/* translators: %s: rating value. */
	$iim_items[] = array( 'star', sprintf( __( '%s on Google', 'iim' ), iim_opt( 'rating_value' ) ), iim_opt( 'review_url' ) );
}
?>
<ul class="trust-strip" aria-label="<?php esc_attr_e( 'Why customers choose us', 'iim' ); ?>">
	<?php foreach ( $iim_items as $iim_item ) : ?>
		<li>
			<?php echo iim_icon( $iim_item[0] ); // phpcs:ignore ?>
			<?php if ( ! empty( $iim_item[2] ) ) : ?>
				<a href="<?php echo esc_url( $iim_item[2] ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $iim_item[1] ); ?></a>
			<?php else : ?>
				<span><?php echo esc_html( $iim_item[1] ); ?></span>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ul>
<?php
if ( ! iim_opt( 'dewa_show' ) ) {
	echo iim_placeholder( __( 'DEWA compliance badge hidden until proof is supplied', 'iim' ) ); // phpcs:ignore
}
