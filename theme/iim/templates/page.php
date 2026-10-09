<?php
/**
 * Default page (legal pages and simple content pages).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_updated = get_the_modified_date();
	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'lead' => iim_field( 'hero_subhead', get_the_ID() ),
			/* translators: %s: date. */
			'meta' => '<span>' . esc_html( sprintf( __( 'Last updated %s', 'iim' ), $iim_updated ) ) . '</span>',
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="prose"><?php the_content(); ?></div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
