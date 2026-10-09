<?php
/**
 * Guides hub (/guides/).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title'   => iim_opt( 'guides_hub_title', __( 'Home maintenance guides for Dubai homes', 'iim' ) ),
		'eyebrow' => __( 'Guides', 'iim' ),
		'lead'    => iim_opt( 'guides_hub_lead', __( 'Practical advice on electrical safety, plumbing problems and keeping your property in good shape through the Dubai summer.', 'iim' ) ),
	)
);
?>
<section class="section" aria-labelledby="guides-list">
	<div class="container">
		<h2 id="guides-list" class="screen-reader-text"><?php esc_html_e( 'Guides', 'iim' ); ?></h2>
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
			<p class="lead"><?php esc_html_e( 'Our first guides are being written by the team.', 'iim' ); ?></p>
		<?php endif; ?>
	</div>
</section>
<?php
get_template_part( 'template-parts/cta-band' );
get_footer();
