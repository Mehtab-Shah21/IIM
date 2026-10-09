<?php
/**
 * Template Name: FAQ
 *
 * All FAQ posts, grouped by topic. Every item is also emitted as FAQPage schema.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title'   => iim_field( 'hero_headline', get_the_ID(), get_the_title() ),
			'eyebrow' => __( 'FAQ', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', get_the_ID() ),
		)
	);
endwhile;

$iim_topics = taxonomy_exists( 'faq_topic' ) ? get_terms( array( 'taxonomy' => 'faq_topic', 'hide_empty' => true, 'orderby' => 'term_order' ) ) : array();
?>
<section class="section">
	<div class="container">
		<?php if ( $iim_topics && ! is_wp_error( $iim_topics ) ) : ?>
			<div class="stack stack--lg">
				<?php foreach ( $iim_topics as $iim_topic ) : ?>
					<section class="content-block" aria-labelledby="topic-<?php echo esc_attr( $iim_topic->slug ); ?>">
						<h2 id="topic-<?php echo esc_attr( $iim_topic->slug ); ?>"><?php echo esc_html( $iim_topic->name ); ?></h2>
						<?php get_template_part( 'template-parts/faq', null, array( 'items' => iim_faq_posts( array( 'topic' => $iim_topic->slug ) ) ) ); ?>
					</section>
				<?php endforeach; ?>
			</div>
		<?php else : ?>
			<?php get_template_part( 'template-parts/faq', null, array( 'items' => iim_faq_posts() ) ); ?>
		<?php endif; ?>
	</div>
</section>
<?php
get_template_part( 'template-parts/cta-band', null, array( 'heading' => __( 'Did not find your answer?', 'iim' ), 'text' => __( 'Send us your question on WhatsApp with a photo of the issue and we will reply.', 'iim' ) ) );
get_footer();
