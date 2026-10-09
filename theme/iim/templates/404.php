<?php
/**
 * 404: helpful routes instead of a dead end. Noindex is handled by WordPress/Rank Math.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title' => __( 'We could not find that page', 'iim' ),
		'lead'  => __( 'The link may be old or mistyped. These pages should help you find what you need.', 'iim' ),
	)
);
?>
<section class="section" aria-labelledby="popular">
	<div class="container">
		<h2 id="popular" class="section__head"><?php esc_html_e( 'Popular services', 'iim' ); ?></h2>
		<div class="cards cards--3">
			<?php foreach ( array_slice( iim_services(), 0, 6 ) as $iim_service ) : ?>
				<?php get_template_part( 'template-parts/service-card', null, array( 'post' => $iim_service ) ); ?>
			<?php endforeach; ?>
		</div>
		<div class="section__foot">
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to the homepage', 'iim' ); ?></a>
			<a class="btn btn--secondary" href="<?php echo esc_url( iim_page_url( 'contact' ) ); ?>"><?php esc_html_e( 'Contact us', 'iim' ); ?></a>
		</div>
	</div>
</section>
<?php
get_footer();
