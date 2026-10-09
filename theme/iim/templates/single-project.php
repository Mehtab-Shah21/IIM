<?php
/**
 * Single project: before/after, what we did, service and area links, gallery.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id      = get_the_ID();
	$iim_service = array_filter( array_map( 'get_post', (array) iim_field( 'service', $iim_id, array() ) ) );
	$iim_areas   = array_filter( array_map( 'get_post', (array) iim_field( 'area', $iim_id, array() ) ) );
	$iim_gallery = (array) iim_field( 'gallery', $iim_id, array() );
	$iim_done    = iim_field( 'completed', $iim_id );

	$iim_meta = '';
	if ( iim_field( 'location_text', $iim_id ) ) {
		$iim_meta .= '<span>' . esc_html( iim_field( 'location_text', $iim_id ) ) . '</span>';
	}
	if ( $iim_done ) {
		/* translators: %s: date. */
		$iim_meta .= '<span>' . esc_html( sprintf( __( 'Completed %s', 'iim' ), date_i18n( 'F Y', strtotime( $iim_done ) ) ) ) . '</span>';
	}

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'eyebrow' => __( 'Project', 'iim' ),
			'lead'    => iim_field( 'direct_answer', $iim_id ),
			'meta'    => $iim_meta,
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<div class="content-layout__main">
					<?php get_template_part( 'template-parts/gallery', null, array( 'posts' => array( get_post() ) ) ); ?>
					<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>
					<?php if ( get_the_content() ) : ?>
						<div class="prose"><?php the_content(); ?></div>
					<?php endif; ?>

					<?php if ( $iim_gallery ) : ?>
						<section class="content-block" aria-labelledby="gallery-title">
							<h2 id="gallery-title"><?php esc_html_e( 'More photos', 'iim' ); ?></h2>
							<div class="cards cards--2">
								<?php foreach ( $iim_gallery as $iim_img ) : ?>
									<div class="media-text__img"><?php echo iim_img( $iim_img, 'iim-card', '(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw' ); // phpcs:ignore ?></div>
								<?php endforeach; ?>
							</div>
						</section>
					<?php endif; ?>

					<?php if ( $iim_service || $iim_areas ) : ?>
						<ul class="chip-list">
							<?php foreach ( array_merge( $iim_service, $iim_areas ) as $iim_link ) : ?>
								<li><a class="chip" href="<?php echo esc_url( get_permalink( $iim_link ) ); ?>"><?php echo esc_html( get_the_title( $iim_link ) ); ?></a></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
				<aside class="content-layout__aside" aria-label="<?php esc_attr_e( 'Book a similar job', 'iim' ); ?>">
					<?php get_template_part( 'template-parts/aside-cta', null, array( 'heading' => __( 'Need something similar?', 'iim' ), 'service_slug' => $iim_service ? $iim_service[0]->post_name : '' ) ); ?>
				</aside>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
