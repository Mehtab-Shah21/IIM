<?php
/**
 * Template Name: Annual Contract hub
 *
 * /annual-maintenance-contract/: what an AMC covers, residential vs commercial, how it works, FAQ.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id   = get_the_ID();
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
			<div class="content-layout__main">
				<?php get_template_part( 'template-parts/answer-box', null, array( 'post_id' => $iim_id ) ); ?>
			</div>
			<div class="cards cards--2 block-gap">
				<?php foreach ( array( 'residential', 'commercial' ) as $iim_plan ) : ?>
					<?php $iim_page = get_page_by_path( 'annual-maintenance-contract/' . $iim_plan ); ?>
					<?php if ( $iim_page ) : ?>
						<article class="card" data-reveal>
							<div class="card__body">
								<span class="icon-tile"><?php echo iim_icon( 'residential' === $iim_plan ? 'house' : 'building-2' ); // phpcs:ignore ?></span>
								<h2 class="card__title"><a href="<?php echo esc_url( get_permalink( $iim_page ) ); ?>"><?php echo esc_html( get_the_title( $iim_page ) ); ?></a></h2>
								<p class="card__text"><?php echo esc_html( iim_field( 'card_summary', $iim_page->ID ) ); ?></p>
								<div class="card__cta"><span class="link-arrow" aria-hidden="true"><?php esc_html_e( 'See what is included', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></span></div>
							</div>
						</article>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section class="section section--surface">
		<div class="container">
			<div class="content-layout__main">
				<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>
				<?php if ( $iim_faqs ) : ?>
					<section class="content-block" aria-labelledby="faq-title">
						<h2 id="faq-title"><?php esc_html_e( 'Annual contract questions', 'iim' ); ?></h2>
						<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs ) ); ?>
					</section>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<section class="section section--cream" id="apply" aria-labelledby="apply-title">
		<div class="container">
			<div class="split split--wide-left">
				<div class="stack">
					<h2 id="apply-title"><?php esc_html_e( 'Apply for a contract', 'iim' ); ?></h2>
					<p class="lead"><?php esc_html_e( 'Tell us about the property. We call you back to agree the visit schedule and coverage before anything is signed.', 'iim' ); ?></p>
				</div>
				<div class="form-panel" data-track-zone="amc-hub">
					<?php get_template_part( 'template-parts/amc-form', null, array( 'id_prefix' => 'amc-hub' ) ); ?>
				</div>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
