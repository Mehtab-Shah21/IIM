<?php
/**
 * Template Name: Reviews
 *
 * Genuine testimonials only (permission confirmed), visible Google rating, link to Google reviews.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_reviews = iim_testimonials( 60 );

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', get_the_ID(), get_the_title() ),
			'eyebrow' => __( 'Reviews', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', get_the_ID() ),
		)
	);
	?>
	<section class="section" aria-labelledby="reviews-title">
		<div class="container">
			<div class="section__head">
				<h2 id="reviews-title"><?php esc_html_e( 'What customers say', 'iim' ); ?></h2>
				<?php get_template_part( 'template-parts/rating-summary' ); ?>
			</div>
			<?php if ( $iim_reviews ) : ?>
				<div class="cards cards--3">
					<?php foreach ( $iim_reviews as $iim_review ) : ?>
						<?php get_template_part( 'template-parts/testimonial', null, array( 'post' => $iim_review ) ); ?>
					<?php endforeach; ?>
				</div>
			<?php else : ?>
				<?php echo iim_placeholder( __( 'testimonials appear here once "Permission to publish" is ticked', 'iim' ) ); // phpcs:ignore ?>
			<?php endif; ?>
			<div class="section__foot">
				<?php if ( iim_opt( 'review_url' ) ) : ?>
					<a class="btn btn--primary" href="<?php echo esc_url( iim_opt( 'review_url' ) ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'star' ); // phpcs:ignore ?><?php esc_html_e( 'Read all reviews on Google', 'iim' ); ?></a>
				<?php endif; ?>
				<?php if ( iim_opt( 'gbp_url' ) ) : ?>
					<a class="btn btn--secondary" href="<?php echo esc_url( iim_opt( 'gbp_url' ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Leave us a review', 'iim' ); ?></a>
				<?php endif; ?>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_template_part( 'template-parts/cta-band' );
get_footer();
