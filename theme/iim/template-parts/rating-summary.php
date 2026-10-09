<?php
/**
 * Visible Google rating. Shown only when a real rating is entered and switched on in Business Info.
 * AggregateRating schema is only emitted on templates that render this (see inc/schema-hooks.php).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_value = iim_opt( 'rating_value' );
$iim_count = (int) iim_opt( 'rating_count' );

if ( ! iim_opt( 'rating_show' ) || ! $iim_value || ! $iim_count ) {
	return;
}
?>
<p class="cluster">
	<span class="stars" aria-hidden="true"><?php echo str_repeat( iim_icon( 'star' ), (int) round( (float) $iim_value ) ); // phpcs:ignore ?></span>
	<strong>
		<?php
		/* translators: 1: rating value, 2: number of reviews. */
		echo esc_html( sprintf( _n( '%1$s out of 5 from %2$s Google review', '%1$s out of 5 from %2$s Google reviews', $iim_count, 'iim' ), $iim_value, number_format_i18n( $iim_count ) ) );
		?>
	</strong>
</p>
