<?php
/**
 * Single guide: direct answer, named author and reviewer, last reviewed date, article, FAQ,
 * link to the related service.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$iim_id       = get_the_ID();
	$iim_faqs     = iim_post_faqs( $iim_id );
	$iim_author   = iim_field( 'author_name', $iim_id );
	$iim_reviewer = iim_field( 'reviewer_name', $iim_id );
	$iim_creds    = iim_field( 'reviewer_credentials', $iim_id );
	$iim_reviewed = iim_field( 'last_reviewed', $iim_id );
	$iim_service  = array_filter( array_map( 'get_post', (array) iim_field( 'related_services', $iim_id, array() ) ) );

	$iim_meta = array();
	if ( $iim_author ) {
		/* translators: %s: author name. */
		$iim_meta[] = '<span>' . esc_html( sprintf( __( 'Written by %s', 'iim' ), $iim_author ) ) . '</span>';
	}
	if ( $iim_reviewer ) {
		/* translators: 1: reviewer name, 2: credentials. */
		$iim_meta[] = '<span>' . esc_html( trim( sprintf( __( 'Reviewed by %1$s %2$s', 'iim' ), $iim_reviewer, $iim_creds ? '(' . $iim_creds . ')' : '' ) ) ) . '</span>';
	}
	if ( $iim_reviewed ) {
		/* translators: %s: date. */
		$iim_meta[] = '<span>' . esc_html( sprintf( __( 'Last reviewed %s', 'iim' ), date_i18n( get_option( 'date_format' ), strtotime( $iim_reviewed ) ) ) ) . '</span>';
	}

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'eyebrow' => __( 'Guide', 'iim' ),
			'meta'    => implode( '', $iim_meta ),
		)
	);
	?>
	<section class="section">
		<div class="container">
			<div class="content-layout">
				<article class="content-layout__main">
					<?php get_template_part( 'template-parts/answer-box', null, array( 'post_id' => $iim_id ) ); ?>
					<div class="prose"><?php the_content(); ?></div>
					<?php if ( $iim_faqs ) : ?>
						<section class="content-block" aria-labelledby="faq-title">
							<h2 id="faq-title"><?php esc_html_e( 'Questions and answers', 'iim' ); ?></h2>
							<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs ) ); ?>
						</section>
					<?php endif; ?>
					<?php if ( $iim_service ) : ?>
						<section class="content-block" aria-labelledby="guide-services">
							<h2 id="guide-services"><?php esc_html_e( 'Need a hand with this?', 'iim' ); ?></h2>
							<ul class="chip-list">
								<?php foreach ( $iim_service as $iim_s ) : ?>
									<li><a class="chip" href="<?php echo esc_url( get_permalink( $iim_s ) ); ?>"><?php echo esc_html( get_the_title( $iim_s ) ); ?></a></li>
								<?php endforeach; ?>
							</ul>
						</section>
					<?php endif; ?>
				</article>
				<aside class="content-layout__aside" aria-label="<?php esc_attr_e( 'Book a technician', 'iim' ); ?>">
					<?php get_template_part( 'template-parts/aside-cta', null, array( 'service_slug' => $iim_service ? $iim_service[0]->post_name : '' ) ); ?>
				</aside>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
