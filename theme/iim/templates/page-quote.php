<?php
/**
 * Template Name: Get a Quote
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', get_the_ID(), get_the_title() ),
			'eyebrow' => __( 'Get a Quote', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', get_the_ID(), __( 'Tell us the issue, add a photo if you can, and choose a time. We reply to confirm, and you pay after the service.', 'iim' ) ),
		)
	);
endwhile;
?>
<section class="section">
	<div class="container">
		<div class="content-layout">
			<div class="content-layout__main">
				<div class="form-panel">
					<h2 class="screen-reader-text"><?php esc_html_e( 'Quote request form', 'iim' ); ?></h2>
					<?php get_template_part( 'template-parts/quote-form' ); ?>
				</div>
			</div>
			<aside class="content-layout__aside" aria-labelledby="quote-aside-title">
				<div class="sticky">
					<div class="panel">
						<h2 id="quote-aside-title"><?php esc_html_e( 'Prefer WhatsApp?', 'iim' ); ?></h2>
						<p><?php esc_html_e( 'Send a photo or short video of the issue with your location. It is the quickest way to book.', 'iim' ); ?></p>
						<?php if ( iim_wa_href() ) : ?>
							<a class="btn btn--whatsapp btn--block" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener" data-track="quote-aside"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
						<?php endif; ?>
						<?php if ( iim_tel_href() ) : ?>
							<a class="btn btn--secondary btn--block" href="<?php echo esc_url( iim_tel_href() ); ?>" data-track="quote-aside"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( iim_phone_display() ); ?></a>
						<?php endif; ?>
						<ul class="checklist">
							<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'You pay after the service', 'iim' ); ?></span></li>
							<?php if ( iim_opt( 'free_quote' ) ) : ?>
								<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'Quotes are free', 'iim' ); ?></span></li>
							<?php endif; ?>
							<?php if ( iim_opt( 'response_time_text' ) ) : ?>
								<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php echo esc_html( iim_opt( 'response_time_text' ) ); ?></span></li>
							<?php endif; ?>
						</ul>
					</div>
				</div>
			</aside>
		</div>
	</div>
</section>
<?php
get_footer();
