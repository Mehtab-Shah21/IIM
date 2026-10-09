<?php
/**
 * Services hub (/services/). Intro text is editable in Business Info > Hub pages.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title'   => iim_opt( 'services_hub_title', __( 'Home maintenance and repair services in Dubai', 'iim' ) ),
		'eyebrow' => __( 'Services', 'iim' ),
		'lead'    => iim_opt( 'services_hub_lead', __( 'Electrical, plumbing, AC, painting, handyman, renovation and emergency repairs for apartments, villas, offices and shops across Dubai. Book in three steps and pay after the service.', 'iim' ) ),
		'buttons' => true,
	)
);
?>
<section class="section" aria-labelledby="all-services">
	<div class="container">
		<h2 id="all-services" class="screen-reader-text"><?php esc_html_e( 'All services', 'iim' ); ?></h2>
		<div class="cards cards--3">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/service-card', null, array( 'post' => get_post() ) );
			endwhile;
			?>
		</div>
	</div>
</section>

<section class="section section--surface" aria-labelledby="amc-band">
	<div class="container">
		<div class="split">
			<div class="stack">
				<p class="eyebrow"><?php esc_html_e( 'Prefer a yearly plan?', 'iim' ); ?></p>
				<h2 id="amc-band"><?php esc_html_e( 'Annual maintenance contracts', 'iim' ); ?></h2>
				<p class="lead"><?php esc_html_e( 'Regular check-ups for every system in your property, with priority visits when something fails.', 'iim' ); ?></p>
			</div>
			<div class="btn-row">
				<a class="btn btn--primary" href="<?php echo esc_url( iim_page_url( 'annual-maintenance-contract/residential' ) ); ?>"><?php esc_html_e( 'Residential plans', 'iim' ); ?></a>
				<a class="btn btn--secondary" href="<?php echo esc_url( iim_page_url( 'annual-maintenance-contract/commercial' ) ); ?>"><?php esc_html_e( 'Commercial plans', 'iim' ); ?></a>
			</div>
		</div>
	</div>
</section>
<?php
get_template_part( 'template-parts/cta-band' );
get_footer();
