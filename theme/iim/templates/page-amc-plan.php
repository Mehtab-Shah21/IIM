<?php
/**
 * Template Name: Annual Contract plan (residential or commercial)
 *
 * The plan type is the page slug ("residential" or "commercial").
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id   = get_the_ID();
	$iim_plan = in_array( get_post_field( 'post_name' ), array( 'residential', 'commercial' ), true ) ? get_post_field( 'post_name' ) : '';
	$iim_faqs = iim_post_faqs( $iim_id );

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', $iim_id, get_the_title() ),
			'eyebrow' => __( 'Annual Maintenance Contract', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', $iim_id ),
			'buttons' => '#apply',
			'button_label' => __( 'Apply now', 'iim' ),
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<div class="content-layout__main">
					<?php get_template_part( 'template-parts/answer-box', null, array( 'post_id' => $iim_id ) ); ?>
					<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>
					<?php if ( $iim_faqs ) : ?>
						<section class="content-block" aria-labelledby="faq-title">
							<h2 id="faq-title"><?php esc_html_e( 'Questions about this plan', 'iim' ); ?></h2>
							<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs ) ); ?>
						</section>
					<?php endif; ?>
				</div>
				<aside class="content-layout__aside" id="apply" aria-labelledby="apply-title">
					<div class="sticky">
						<div class="form-panel" data-track-zone="amc-plan">
							<h2 id="apply-title"><?php esc_html_e( 'Apply for this plan', 'iim' ); ?></h2>
							<?php get_template_part( 'template-parts/amc-form', null, array( 'plan' => $iim_plan, 'id_prefix' => 'amc-plan' ) ); ?>
						</div>
					</div>
				</aside>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_template_part( 'template-parts/cta-band' );
get_footer();
