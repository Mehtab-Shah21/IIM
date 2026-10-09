<?php
/**
 * Before and after gallery of real projects (project post type with before/after images).
 *
 * Args: posts (WP_Post[]).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_posts = $args['posts'] ?? array();
if ( ! $iim_posts ) {
	if ( iim_show_placeholders() ) {
		echo '<p>' . iim_placeholder( __( 'add projects with real before and after photos; this section is hidden from visitors until then', 'iim' ) ) . '</p>'; // phpcs:ignore
	}
	return;
}
?>
<div class="ba-grid">
	<?php foreach ( $iim_posts as $iim_post ) : ?>
		<?php
		$iim_before = iim_field( 'before_image', $iim_post->ID );
		$iim_after  = iim_field( 'after_image', $iim_post->ID );
		$iim_where  = iim_field( 'location_text', $iim_post->ID );
		?>
		<figure class="ba" data-reveal>
			<div class="ba__pair">
				<div class="ba__img">
					<?php echo iim_img( $iim_before, 'iim-square', '(min-width: 1280px) 190px, (min-width: 768px) 25vw, 50vw', array(), __( 'before photo', 'iim' ) ); // phpcs:ignore ?>
					<span class="ba__label"><?php esc_html_e( 'Before', 'iim' ); ?></span>
				</div>
				<div class="ba__img">
					<?php echo iim_img( $iim_after, 'iim-square', '(min-width: 1280px) 190px, (min-width: 768px) 25vw, 50vw', array(), __( 'after photo', 'iim' ) ); // phpcs:ignore ?>
					<span class="ba__label"><?php esc_html_e( 'After', 'iim' ); ?></span>
				</div>
			</div>
			<figcaption>
				<a href="<?php echo esc_url( get_permalink( $iim_post ) ); ?>"><?php echo esc_html( get_the_title( $iim_post ) ); ?></a>
				<?php if ( $iim_where ) : ?>
					<span><?php echo esc_html( $iim_where ); ?></span>
				<?php endif; ?>
			</figcaption>
		</figure>
	<?php endforeach; ?>
</div>
