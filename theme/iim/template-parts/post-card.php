<?php
/**
 * Generic card for guides and projects.
 *
 * Args: post (WP_Post).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_post  = $args['post'] ?? get_post();
$iim_image = get_post_thumbnail_id( $iim_post ) ?: iim_field( 'after_image', $iim_post->ID );
$iim_cta   = 'project' === $iim_post->post_type ? __( 'See the project', 'iim' ) : __( 'Read the guide', 'iim' );
?>
<article class="card" data-reveal>
	<div class="card__media">
		<?php echo iim_img( $iim_image, 'iim-card', '(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw', array( 'alt' => '' ), get_the_title( $iim_post ) ); // phpcs:ignore ?>
	</div>
	<div class="card__body">
		<h3 class="card__title"><a href="<?php echo esc_url( get_permalink( $iim_post ) ); ?>"><?php echo esc_html( get_the_title( $iim_post ) ); ?></a></h3>
		<p class="card__text"><?php echo esc_html( iim_field( 'direct_answer', $iim_post->ID ) ? wp_trim_words( iim_field( 'direct_answer', $iim_post->ID ), 24 ) : get_the_excerpt( $iim_post ) ); ?></p>
		<div class="card__cta">
			<span class="link-arrow" aria-hidden="true"><?php echo esc_html( $iim_cta ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></span>
		</div>
	</div>
</article>
