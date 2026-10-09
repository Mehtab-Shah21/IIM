<?php
/**
 * Projects hub (/projects/).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title'   => iim_opt( 'projects_hub_title', __( 'Our work in Dubai', 'iim' ) ),
		'eyebrow' => __( 'Projects', 'iim' ),
		'lead'    => iim_opt( 'projects_hub_lead', __( 'Photos of real electrical, plumbing, painting and renovation jobs completed by our team.', 'iim' ) ),
	)
);
?>
<section class="section" aria-labelledby="projects-list">
	<div class="container">
		<h2 id="projects-list" class="screen-reader-text"><?php esc_html_e( 'Projects', 'iim' ); ?></h2>
		<?php if ( have_posts() ) : ?>
			<div class="cards cards--3">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/post-card', null, array( 'post' => get_post() ) );
				endwhile;
				?>
			</div>
			<?php the_posts_pagination( array( 'class' => 'pagination' ) ); ?>
		<?php else : ?>
			<p class="lead"><?php esc_html_e( 'Project photos are on their way. In the meantime, ask us on WhatsApp for examples of similar jobs.', 'iim' ); ?></p>
		<?php endif; ?>
	</div>
</section>
<?php
get_template_part( 'template-parts/cta-band' );
get_footer();
