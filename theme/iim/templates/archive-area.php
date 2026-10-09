<?php
/**
 * Areas hub (/areas/).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title'   => iim_opt( 'areas_hub_title', __( 'Areas we serve in Dubai', 'iim' ) ),
		'eyebrow' => __( 'Areas', 'iim' ),
		'lead'    => iim_opt( 'areas_hub_lead', __( 'Choose your community to see the services we offer there and how to book a visit.', 'iim' ) ),
		'buttons' => true,
	)
);
?>
<section class="section" aria-labelledby="areas-list">
	<div class="container">
		<h2 id="areas-list" class="screen-reader-text"><?php esc_html_e( 'Service areas', 'iim' ); ?></h2>
		<?php if ( have_posts() ) : ?>
			<div class="cards cards--3">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/area-card', null, array( 'post' => get_post() ) );
				endwhile;
				?>
			</div>
		<?php else : ?>
			<p class="lead"><?php esc_html_e( 'We work across Dubai. Message us with your location and we will confirm the visit.', 'iim' ); ?></p>
			<?php echo iim_placeholder( __( 'add one Area page per confirmed service area', 'iim' ) ); // phpcs:ignore ?>
		<?php endif; ?>
	</div>
</section>
<?php
get_template_part( 'template-parts/cta-band' );
get_footer();
