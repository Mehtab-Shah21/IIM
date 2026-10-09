<?php
/**
 * Search results (noindex; blocked in robots.txt).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		/* translators: %s: search query. */
		'title' => sprintf( __( 'Results for "%s"', 'iim' ), get_search_query() ),
	)
);
?>
<section class="section">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="cards cards--3">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'service' === get_post_type() ? 'template-parts/service-card' : 'template-parts/post-card', null, array( 'post' => get_post() ) );
				endwhile;
				?>
			</div>
			<?php the_posts_pagination( array( 'class' => 'pagination' ) ); ?>
		<?php else : ?>
			<p class="lead"><?php esc_html_e( 'No results. Try another word, or message us on WhatsApp and we will help.', 'iim' ); ?></p>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
