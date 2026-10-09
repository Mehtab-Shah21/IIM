<?php
/**
 * Single area: direct answer, genuinely local notes (body sections), services offered here,
 * projects completed nearby, FAQ.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id       = get_the_ID();
	$iim_faqs     = iim_post_faqs( $iim_id );
	$iim_services = array_filter( array_map( 'get_post', (array) iim_field( 'services_offered', $iim_id, array() ) ) ) ?: iim_services();
	$iim_projects = post_type_exists( 'project' ) ? get_posts(
		array(
			'post_type'      => 'project',
			'posts_per_page' => 3,
			'no_found_rows'  => true,
			'meta_query'     => array( array( 'key' => 'area', 'value' => '"' . $iim_id . '"', 'compare' => 'LIKE' ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	) : array();

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			/* translators: %s: area name. */
			'title'   => iim_field( 'hero_headline', $iim_id, sprintf( __( 'Electrician and plumber in %s, Dubai', 'iim' ), get_the_title() ) ),
			'eyebrow' => get_the_title(),
			'lead'    => iim_field( 'hero_subhead', $iim_id ),
			'buttons' => true,
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<div class="content-layout__main">
					<?php get_template_part( 'template-parts/answer-box', null, array( 'post_id' => $iim_id ) ); ?>
					<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>

					<section class="content-block" aria-labelledby="area-services">
						<h2 id="area-services">
							<?php
							/* translators: %s: area name. */
							echo esc_html( sprintf( __( 'Services in %s', 'iim' ), get_the_title() ) );
							?>
						</h2>
						<ul class="chip-list">
							<?php foreach ( $iim_services as $iim_service ) : ?>
								<li><a class="chip" href="<?php echo esc_url( get_permalink( $iim_service ) ); ?>"><?php echo iim_icon( iim_service_icon( $iim_service->ID ), 'icon--sm' ); // phpcs:ignore ?><?php echo esc_html( get_the_title( $iim_service ) ); ?></a></li>
							<?php endforeach; ?>
						</ul>
					</section>

					<?php if ( $iim_projects ) : ?>
						<section class="content-block" aria-labelledby="area-projects">
							<h2 id="area-projects"><?php esc_html_e( 'Recent work nearby', 'iim' ); ?></h2>
							<?php get_template_part( 'template-parts/gallery', null, array( 'posts' => $iim_projects ) ); ?>
						</section>
					<?php endif; ?>

					<?php if ( $iim_faqs ) : ?>
						<section class="content-block" aria-labelledby="faq-title">
							<h2 id="faq-title"><?php esc_html_e( 'Common questions', 'iim' ); ?></h2>
							<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs ) ); ?>
						</section>
					<?php endif; ?>
				</div>
				<aside class="content-layout__aside" aria-label="<?php esc_attr_e( 'Book a visit', 'iim' ); ?>">
					<?php get_template_part( 'template-parts/aside-cta' ); ?>
				</aside>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_template_part( 'template-parts/cta-band' );
get_footer();
