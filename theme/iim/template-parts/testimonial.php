<?php
/**
 * One testimonial. Only testimonials with permission_confirmed are ever queried (iim_testimonials()).
 *
 * Args: post (WP_Post).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_post    = $args['post'];
$iim_rating  = (int) iim_field( 'rating', $iim_post->ID, 0 );
$iim_context = iim_field( 'context', $iim_post->ID );
$iim_source  = iim_field( 'source_url', $iim_post->ID );
?>
<figure class="testimonial" data-reveal>
	<?php echo iim_icon( 'quote', 'icon--lg' ); // phpcs:ignore ?>
	<?php if ( $iim_rating ) : ?>
		<span class="stars" role="img" aria-label="<?php echo esc_attr( sprintf( /* translators: %d: rating. */ __( 'Rated %d out of 5', 'iim' ), $iim_rating ) ); ?>">
			<?php echo str_repeat( iim_icon( 'star' ), min( 5, $iim_rating ) ); // phpcs:ignore ?>
		</span>
	<?php endif; ?>
	<blockquote><p><?php echo esc_html( wp_strip_all_tags( $iim_post->post_content ) ); ?></p></blockquote>
	<figcaption>
		<strong><?php echo esc_html( get_the_title( $iim_post ) ); ?></strong>
		<?php if ( $iim_context ) : ?>
			<span><?php echo esc_html( $iim_context ); ?></span>
		<?php endif; ?>
		<?php if ( $iim_source ) : ?>
			<span><a href="<?php echo esc_url( $iim_source ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'View on Google', 'iim' ); ?></a></span>
		<?php endif; ?>
	</figcaption>
</figure>
