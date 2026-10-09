<?php
/**
 * Area card.
 *
 * Args: post (WP_Post).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_post = $args['post'] ?? get_post();
?>
<article class="card" data-reveal>
	<div class="card__body">
		<span class="icon-tile"><?php echo iim_icon( 'map-pin' ); // phpcs:ignore ?></span>
		<h3 class="card__title"><a href="<?php echo esc_url( get_permalink( $iim_post ) ); ?>"><?php echo esc_html( get_the_title( $iim_post ) ); ?></a></h3>
		<p class="card__text"><?php echo esc_html( iim_field( 'card_summary', $iim_post->ID, get_the_excerpt( $iim_post ) ) ); ?></p>
		<div class="card__cta">
			<span class="link-arrow" aria-hidden="true"><?php esc_html_e( 'Services in this area', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></span>
		</div>
	</div>
</article>
