<?php
/**
 * Service card: 16/10 media, icon, title, summary, CTA pinned to the bottom.
 *
 * Args: post (WP_Post), heading_level (int, default 3).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_post  = $args['post'] ?? get_post();
$iim_level = (int) ( $args['heading_level'] ?? 3 );
$iim_image = iim_field( 'card_image', $iim_post->ID ) ?: get_post_thumbnail_id( $iim_post );
?>
<article class="card" data-reveal>
	<div class="card__media">
		<?php echo iim_img( $iim_image, 'iim-card', '(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw', array( 'alt' => '' ), get_the_title( $iim_post ) ); // phpcs:ignore ?>
	</div>
	<div class="card__body">
		<span class="icon-tile"><?php echo iim_icon( iim_service_icon( $iim_post->ID ) ); // phpcs:ignore ?></span>
		<h<?php echo esc_attr( $iim_level ); ?> class="card__title">
			<a href="<?php echo esc_url( get_permalink( $iim_post ) ); ?>"><?php echo esc_html( get_the_title( $iim_post ) ); ?></a>
		</h<?php echo esc_attr( $iim_level ); ?>>
		<p class="card__text"><?php echo esc_html( iim_field( 'card_summary', $iim_post->ID, get_the_excerpt( $iim_post ) ) ); ?></p>
		<div class="card__cta">
			<span class="link-arrow" aria-hidden="true"><?php esc_html_e( 'View service', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></span>
		</div>
	</div>
</article>
