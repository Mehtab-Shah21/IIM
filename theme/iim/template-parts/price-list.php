<?php
/**
 * "From" prices for a service. Hidden unless both the global switch (Business Info) and the
 * per-service switch are on, so unconfirmed prices never reach visitors.
 *
 * Args: post_id (int).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_id     = (int) ( $args['post_id'] ?? get_the_ID() );
$iim_prices = array_filter( (array) iim_field( 'prices', $iim_id, array() ), fn( $r ) => ! empty( $r['name'] ) && '' !== ( $r['price_from'] ?? '' ) );

if ( ! $iim_prices ) {
	return;
}

$iim_visible = iim_opt( 'show_prices' ) && iim_field( 'show_prices', $iim_id );

if ( ! $iim_visible ) {
	echo iim_placeholder( __( 'prices are stored but hidden; confirm them, then switch on "Show prices" in Business Info and on this service', 'iim' ) ); // phpcs:ignore
	return;
}
?>
<section class="content-block" aria-labelledby="prices-title" data-reveal>
	<h2 id="prices-title"><?php esc_html_e( 'Starting prices', 'iim' ); ?></h2>
	<ul class="price-list">
		<?php foreach ( $iim_prices as $iim_row ) : ?>
			<li>
				<span>
					<?php echo esc_html( $iim_row['name'] ); ?>
					<?php if ( ! empty( $iim_row['note'] ) ) : ?>
						<small><?php echo esc_html( $iim_row['note'] ); ?></small>
					<?php endif; ?>
				</span>
				<strong>
					<?php
					/* translators: %s: price in AED. */
					echo esc_html( sprintf( __( 'From AED %s', 'iim' ), number_format_i18n( (float) $iim_row['price_from'] ) ) );
					?>
				</strong>
			</li>
		<?php endforeach; ?>
	</ul>
	<p class="muted"><?php echo esc_html( iim_opt( 'price_note', __( 'Final price is confirmed after we see the job. You pay after the service.', 'iim' ) ) ); ?></p>
</section>
