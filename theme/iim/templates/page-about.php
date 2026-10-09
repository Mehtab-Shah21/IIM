<?php
/**
 * Template Name: About
 *
 * Story, standards, credentials (only confirmed ones), team (real people only), coverage.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id      = get_the_ID();
	$iim_team    = array_filter( (array) iim_field( 'team', $iim_id, array() ), fn( $m ) => ! empty( $m['name'] ) );
	$iim_licence = iim_opt( 'license_number' );

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', $iim_id, get_the_title() ),
			'eyebrow' => __( 'About IIM', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', $iim_id ),
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<div class="content-layout__main">
					<?php get_template_part( 'template-parts/sections', null, array( 'post_id' => $iim_id ) ); ?>
				</div>
				<aside class="content-layout__aside" aria-labelledby="creds-title">
					<div class="sticky">
						<div class="panel">
							<h2 id="creds-title"><?php esc_html_e( 'Company details', 'iim' ); ?></h2>
							<ul class="contact-list">
								<li><span class="icon-tile"><?php echo iim_icon( 'building-2' ); // phpcs:ignore ?></span><span><?php echo esc_html( iim_opt( 'legal_name', iim_opt( 'business_name' ) ) ); ?></span></li>
								<?php if ( $iim_licence ) : ?>
									<li><span class="icon-tile"><?php echo iim_icon( 'badge-check' ); // phpcs:ignore ?></span><span><?php /* translators: %s: licence number. */ echo esc_html( sprintf( __( 'Trade licence %s', 'iim' ), $iim_licence ) ); ?></span></li>
								<?php endif; ?>
								<?php if ( iim_opt( 'dewa_show' ) && iim_opt( 'dewa_text' ) ) : ?>
									<li><span class="icon-tile"><?php echo iim_icon( 'shield-check' ); // phpcs:ignore ?></span><span><?php echo esc_html( iim_opt( 'dewa_text' ) ); ?></span></li>
								<?php endif; ?>
								<?php if ( iim_opt( 'insurance_text' ) ) : ?>
									<li><span class="icon-tile"><?php echo iim_icon( 'shield-check' ); // phpcs:ignore ?></span><span><?php echo esc_html( iim_opt( 'insurance_text' ) ); ?></span></li>
								<?php endif; ?>
								<li><span class="icon-tile"><?php echo iim_icon( 'map-pin' ); // phpcs:ignore ?></span><span><?php echo esc_html( iim_address_line() ); ?></span></li>
							</ul>
							<?php echo iim_placeholder( __( 'licence number, DEWA proof and insurance details', 'iim' ) ); // phpcs:ignore ?>
						</div>
					</div>
				</aside>
			</div>
		</div>
	</section>

	<?php if ( $iim_team ) : ?>
		<section class="section section--surface" aria-labelledby="team-title">
			<div class="container">
				<div class="section__head">
					<h2 id="team-title"><?php esc_html_e( 'The people who visit your home', 'iim' ); ?></h2>
				</div>
				<div class="cards cards--4">
					<?php foreach ( $iim_team as $iim_member ) : ?>
						<article class="card" data-reveal>
							<div class="card__media"><?php echo iim_img( $iim_member['photo'] ?? 0, 'iim-card', '(min-width: 1024px) 282px, (min-width: 768px) 50vw, 100vw', array( 'alt' => $iim_member['name'] ), $iim_member['name'] ); // phpcs:ignore ?></div>
							<div class="card__body">
								<h3 class="card__title"><?php echo esc_html( $iim_member['name'] ); ?></h3>
								<p class="card__text"><?php echo esc_html( $iim_member['role'] ?? '' ); ?></p>
								<?php if ( ! empty( $iim_member['credentials'] ) ) : ?>
									<p class="badge"><?php echo esc_html( $iim_member['credentials'] ); ?></p>
								<?php endif; ?>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php else : ?>
		<?php echo iim_placeholder( __( 'technician profiles with real names, roles and photos', 'iim' ) ); // phpcs:ignore ?>
	<?php endif; ?>
	<?php
endwhile;

get_template_part( 'template-parts/cta-band' );
get_footer();
