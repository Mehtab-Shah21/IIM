<?php
/**
 * Generic fallback (required in the theme root). Specific templates live in /templates.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();
get_template_part( 'template-parts/page-hero', null, array( 'title' => is_home() ? single_post_title( '', false ) : get_the_archive_title() ) );
?>
<section class="section">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="cards cards--3">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/post-card' );
				endwhile;
				?>
			</div>
			<?php the_posts_pagination( array( 'class' => 'pagination' ) ); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'Nothing here yet.', 'iim' ); ?></p>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
