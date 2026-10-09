<?php
/**
 * Single service: answer-first (direct answer), body sections, prices (if approved), FAQ,
 * related services and areas, CTA.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id       = get_the_ID();
	$iim_faqs     = iim_post_faqs( $iim_id );
	$iim_related  = array_filter( (array) iim_field( 'related_services', $iim_id, array() ) );
	$iim_reviewed = iim_field( 'last_reviewed', $iim_id );

	$iim_meta = '';
	if ( $iim_reviewed ) {
		/* translators: %s: date. */
		$iim_meta = '<span>' . esc_html( sprintf( __( 'Last reviewed %s', 'iim' ), date_i18n( get_option( 'date_format' ), strtotime( $iim_reviewed ) ) ) ) . '</span>';
	}

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', $iim_id, get_the_title() ),
			'eyebrow' => get_the_title(),
			'lead'    => iim_field( 'hero_subhead', $iim_id ),
			'buttons' => iim_quote_url( get_post_field( 'post_name' ) ),
			'meta'    => $iim_meta,
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<div class="content-layout__main">
					<?php get_template_part( 'template-parts/answer-box', null, array( 'post_id' => $iim_id ) ); ?>
					<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>
					<?php get_template_part( 'template-parts/price-list', null, array( 'post_id' => $iim_id ) ); ?>

					<?php if ( $iim_faqs ) : ?>
						<section class="content-block" aria-labelledby="faq-title">
							<h2 id="faq-title">
								<?php
								/* translators: %s: service name. */
								echo esc_html( sprintf( __( '%s: common questions', 'iim' ), get_the_title() ) );
								?>
							</h2>
							<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs ) ); ?>
						</section>
					<?php endif; ?>
				</div>
				<aside class="content-layout__aside" aria-label="<?php esc_attr_e( 'Book this service', 'iim' ); ?>">
					<?php get_template_part( 'template-parts/aside-cta', null, array( 'service_slug' => get_post_field( 'post_name' ) ) ); ?>
				</aside>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/related', null, array( 'post_id' => $iim_id, 'related' => $iim_related ) ); ?>
	<?php
endwhile;

get_template_part( 'template-parts/cta-band' );
get_footer();
