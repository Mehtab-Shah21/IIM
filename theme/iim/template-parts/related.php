<?php
/**
 * Related services (internal links) and the areas where this service is offered.
 *
 * Args: post_id (int), related (array of post IDs or WP_Post).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_id      = (int) ( $args['post_id'] ?? get_the_ID() );
$iim_related = array_filter( array_map( 'get_post', (array) ( $args['related'] ?? array() ) ) );

if ( ! $iim_related ) {
	$iim_related = array_slice( array_filter( iim_services(), fn( $s ) => $s->ID !== $iim_id ), 0, 3 );
}

$iim_areas = post_type_exists( 'area' ) ? get_posts( array( 'post_type' => 'area', 'posts_per_page' => 24, 'orderby' => 'title', 'order' => 'ASC', 'no_found_rows' => true ) ) : array();
?>
<section class="section section--surface" aria-labelledby="related-title">
	<div class="container">
		<div class="section__head">
			<h2 id="related-title"><?php esc_html_e( 'Related services', 'iim' ); ?></h2>
		</div>
		<div class="cards cards--3">
			<?php foreach ( array_slice( $iim_related, 0, 3 ) as $iim_post ) : ?>
				<?php get_template_part( 'template-parts/service-card', null, array( 'post' => $iim_post ) ); ?>
			<?php endforeach; ?>
		</div>

		<?php if ( $iim_areas ) : ?>
			<div class="stack block-gap">
				<h2 class="h3"><?php esc_html_e( 'Areas we cover in Dubai', 'iim' ); ?></h2>
				<ul class="chip-list">
					<?php foreach ( $iim_areas as $iim_area ) : ?>
						<li><a class="chip" href="<?php echo esc_url( get_permalink( $iim_area ) ); ?>"><?php echo iim_icon( 'map-pin', 'icon--sm' ); // phpcs:ignore ?><?php echo esc_html( get_the_title( $iim_area ) ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>
	</div>
</section>
