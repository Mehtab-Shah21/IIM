<?php
/**
 * Homepage: hero, services, how it works, why IIM, numbers, before/after, AMC, testimonials, FAQ, CTA.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_id      = get_queried_object_id();
$iim_hero_im = iim_field( 'hero_image', $iim_id );
$iim_hero_id = is_array( $iim_hero_im ) ? ( $iim_hero_im['ID'] ?? 0 ) : (int) $iim_hero_im;
$iim_sizes   = '(min-width: 1024px) 380px, 100vw';

if ( $iim_hero_id ) {
	iim_preload_image( $iim_hero_id, 'iim-hero', $iim_sizes );
}

get_header();

$iim_headline = iim_field( 'hero_headline', $iim_id, __( 'Electricians, plumbers and handymen in Dubai', 'iim' ) );
$iim_accent   = iim_field( 'hero_accent', $iim_id, __( 'Your property, our priority.', 'iim' ) );
$iim_promise  = iim_field( 'hero_subhead', $iim_id, __( 'Book in three steps on WhatsApp or online. A technician visits at a time that suits you, and you pay after the job is done.', 'iim' ) );
?>

<section class="hero" data-track-zone="hero">
	<div class="container">
		<div class="hero__inner<?php echo $iim_hero_id ? '' : ' hero__inner--no-media'; ?>">
			<div class="hero__copy">
				<h1><?php echo esc_html( $iim_headline ); ?> <em><?php echo esc_html( $iim_accent ); ?></em></h1>
				<p class="hero__promise"><?php echo esc_html( $iim_promise ); ?></p>
				<div class="btn-row">
					<a class="btn btn--primary" href="<?php echo esc_url( iim_quote_url() ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
					<?php if ( iim_wa_href() ) : ?>
						<a class="btn btn--whatsapp" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
					<?php endif; ?>
				</div>
				<?php get_template_part( 'template-parts/trust-strip' ); ?>
			</div>
			<?php if ( $iim_hero_id ) : ?>
				<div class="hero__media">
					<?php echo iim_img( $iim_hero_id, 'iim-hero', $iim_sizes, array( 'fetchpriority' => 'high', 'decoding' => 'sync' ) ); // phpcs:ignore ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>

<?php // 2. Services. ?>
<section class="section" aria-labelledby="services-title">
	<div class="container">
		<div class="section__head">
			<p class="eyebrow"><?php esc_html_e( 'What we do', 'iim' ); ?></p>
			<h2 id="services-title"><?php echo esc_html( iim_field( 'services_heading', $iim_id, __( 'One team for every repair in your home or business', 'iim' ) ) ); ?></h2>
			<p class="lead"><?php echo esc_html( iim_field( 'services_intro', $iim_id, __( 'From a tripped breaker to a full bathroom refit, our technicians handle the job end to end across Dubai.', 'iim' ) ) ); ?></p>
		</div>
		<div class="cards cards--3">
			<?php foreach ( iim_services() as $iim_service ) : ?>
				<?php get_template_part( 'template-parts/service-card', null, array( 'post' => $iim_service ) ); ?>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php // 3. How it works. ?>
<section class="section section--surface" aria-labelledby="how-title">
	<div class="container">
		<div class="section__head">
			<p class="eyebrow"><?php esc_html_e( 'How it works', 'iim' ); ?></p>
			<h2 id="how-title"><?php esc_html_e( 'Book in three steps', 'iim' ); ?></h2>
		</div>
		<ol class="steps">
			<li class="step" data-reveal>
				<h3><?php esc_html_e( 'Message us', 'iim' ); ?></h3>
				<p><?php esc_html_e( 'Tap WhatsApp or fill in the quote form. Tell us what is wrong in a sentence or two.', 'iim' ); ?></p>
			</li>
			<li class="step" data-reveal>
				<h3><?php esc_html_e( 'Show us the issue', 'iim' ); ?></h3>
				<p><?php esc_html_e( 'Send a photo or a short video. It helps the technician bring the right parts the first time.', 'iim' ); ?></p>
			</li>
			<li class="step" data-reveal>
				<h3><?php esc_html_e( 'Pick a place and time', 'iim' ); ?></h3>
				<p><?php esc_html_e( 'Share your location and the date that suits you. We confirm the visit before we come.', 'iim' ); ?></p>
			</li>
		</ol>
		<p class="steps-note"><?php echo iim_icon( 'wallet' ); // phpcs:ignore ?><?php esc_html_e( 'You pay after the service is done.', 'iim' ); ?></p>
	</div>
</section>

<?php // 4. Why IIM. ?>
<?php
$iim_why = iim_field( 'why_items', $iim_id, array() );
if ( ! $iim_why ) {
	$iim_why = array(
		array( 'icon' => 'wallet', 'title' => __( 'Pay after the service', 'iim' ), 'text' => __( 'You pay once the work is done and you have checked it.', 'iim' ) ),
		array( 'icon' => 'message-circle', 'title' => __( 'Simple booking', 'iim' ), 'text' => __( 'Three steps on WhatsApp or online. A photo of the problem replaces a long explanation.', 'iim' ) ),
		array( 'icon' => 'wrench', 'title' => __( 'One team, many trades', 'iim' ), 'text' => __( 'Electrical, plumbing, AC, painting and handyman work from one company, so one visit can cover several jobs.', 'iim' ) ),
		array( 'icon' => 'calendar-check', 'title' => __( 'Annual contracts', 'iim' ), 'text' => __( 'Scheduled check-ups and priority visits for homes and businesses that want fewer surprises.', 'iim' ) ),
	);
}
?>
<section class="section section--dark" aria-labelledby="why-title">
	<div class="container">
		<div class="section__head">
			<p class="eyebrow"><?php esc_html_e( 'Why IIM', 'iim' ); ?></p>
			<h2 id="why-title"><?php echo esc_html( iim_field( 'why_heading', $iim_id, __( 'Straightforward maintenance, done properly', 'iim' ) ) ); ?></h2>
		</div>
		<div class="cards cards--4">
			<?php foreach ( array_slice( $iim_why, 0, 4 ) as $iim_item ) : ?>
				<div class="card card--feature" data-reveal>
					<div class="card__body">
						<span class="icon-tile"><?php echo iim_icon( $iim_item['icon'] ?: 'check' ); // phpcs:ignore ?></span>
						<h3 class="card__title"><?php echo esc_html( $iim_item['title'] ); ?></h3>
						<p class="card__text"><?php echo esc_html( $iim_item['text'] ); ?></p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php // 5. Numbers: only real, confirmed figures from Business Info. ?>
		<?php $iim_stats = array_filter( (array) iim_opt( 'stats', array() ), fn( $s ) => ! empty( $s['value'] ) && ! empty( $s['label'] ) ); ?>
		<?php if ( $iim_stats ) : ?>
			<ul class="stats stats--spaced" style="--stat-cols: <?php echo esc_attr( (string) min( 4, count( $iim_stats ) ) ); ?>;" aria-label="<?php esc_attr_e( 'IIM in numbers', 'iim' ); ?>">
				<?php foreach ( $iim_stats as $iim_stat ) : ?>
					<li class="stat">
						<span class="stat__value" data-count-to="<?php echo esc_attr( (string) (int) $iim_stat['value'] ); ?>" data-count-suffix="<?php echo esc_attr( $iim_stat['suffix'] ?? '' ); ?>"><?php echo esc_html( number_format_i18n( (int) $iim_stat['value'] ) . ( $iim_stat['suffix'] ?? '' ) ); ?></span>
						<span class="stat__label"><?php echo esc_html( $iim_stat['label'] ); ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<?php echo iim_placeholder( __( 'jobs completed, years in business and areas served: add real figures in Business Info > Numbers', 'iim' ) ); // phpcs:ignore ?>
		<?php endif; ?>
	</div>
</section>

<?php // 6. Before and after. ?>
<?php
$iim_projects = post_type_exists( 'project' ) ? get_posts(
	array(
		'post_type'      => 'project',
		'posts_per_page' => 3,
		'no_found_rows'  => true,
		'meta_query'     => array( array( 'key' => 'after_image', 'compare' => '!=', 'value' => '' ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
	)
) : array();
if ( $iim_projects || iim_show_placeholders() ) :
	?>
	<section class="section" aria-labelledby="work-title">
		<div class="container">
			<div class="section__head">
				<p class="eyebrow"><?php esc_html_e( 'Our work', 'iim' ); ?></p>
				<h2 id="work-title"><?php esc_html_e( 'Before and after', 'iim' ); ?></h2>
				<p class="lead"><?php esc_html_e( 'Real jobs completed by our team in Dubai homes and businesses.', 'iim' ); ?></p>
			</div>
			<?php get_template_part( 'template-parts/gallery', null, array( 'posts' => $iim_projects ) ); ?>
			<?php if ( $iim_projects ) : ?>
				<div class="section__foot">
					<a class="link-arrow" href="<?php echo esc_url( get_post_type_archive_link( 'project' ) ); ?>"><?php esc_html_e( 'See all projects', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
				</div>
			<?php endif; ?>
		</div>
	</section>
<?php endif; ?>

<?php // 7. Annual maintenance highlight with the short application form. ?>
<section class="section section--cream" id="annual-contract" aria-labelledby="amc-title">
	<div class="container">
		<div class="split split--wide-left">
			<div class="stack stack--lg">
				<div class="stack">
					<p class="eyebrow"><?php esc_html_e( 'Annual Maintenance Contract', 'iim' ); ?></p>
					<h2 id="amc-title"><?php echo esc_html( iim_field( 'amc_heading', $iim_id, __( 'Premium care, all year round', 'iim' ) ) ); ?></h2>
					<p class="lead"><?php echo esc_html( iim_field( 'amc_text', $iim_id, __( 'One yearly plan covers regular check-ups of your electrical, plumbing and AC systems, with priority response when something goes wrong.', 'iim' ) ) ); ?></p>
				</div>
				<ul class="amc-highlight__list">
					<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'Scheduled preventive visits, so small faults are caught early', 'iim' ); ?></span></li>
					<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'Priority response for contract customers', 'iim' ); ?></span></li>
					<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'Plans for apartments, villas, offices and shops', 'iim' ); ?></span></li>
					<li><?php echo iim_icon( 'circle-check' ); // phpcs:ignore ?><span><?php esc_html_e( 'One point of contact for every trade', 'iim' ); ?></span></li>
				</ul>
				<a class="link-arrow" href="<?php echo esc_url( iim_page_url( 'annual-maintenance-contract' ) ); ?>"><?php esc_html_e( 'Compare residential and commercial plans', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
			</div>
			<div class="form-panel" data-track-zone="amc-home">
				<h3><?php esc_html_e( 'Apply for a contract', 'iim' ); ?></h3>
				<p class="muted"><?php esc_html_e( 'Leave your details and we will call you to plan the right package.', 'iim' ); ?></p>
				<?php get_template_part( 'template-parts/amc-form', null, array( 'id_prefix' => 'amc-home' ) ); ?>
			</div>
		</div>
	</div>
</section>

<?php // 8. Testimonials. ?>
<?php $iim_reviews = iim_testimonials( 3 ); ?>
<?php if ( $iim_reviews ) : ?>
	<section class="section" aria-labelledby="reviews-title">
		<div class="container">
			<div class="section__head">
				<p class="eyebrow"><?php esc_html_e( 'Reviews', 'iim' ); ?></p>
				<h2 id="reviews-title"><?php esc_html_e( 'What our customers say', 'iim' ); ?></h2>
				<?php get_template_part( 'template-parts/rating-summary' ); ?>
			</div>
			<div class="cards cards--3">
				<?php foreach ( $iim_reviews as $iim_review ) : ?>
					<?php get_template_part( 'template-parts/testimonial', null, array( 'post' => $iim_review ) ); ?>
				<?php endforeach; ?>
			</div>
			<div class="section__foot">
				<?php if ( iim_opt( 'review_url' ) ) : ?>
					<a class="btn btn--secondary" href="<?php echo esc_url( iim_opt( 'review_url' ) ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'star' ); // phpcs:ignore ?><?php esc_html_e( 'Read our Google reviews', 'iim' ); ?></a>
				<?php endif; ?>
				<a class="link-arrow" href="<?php echo esc_url( iim_page_url( 'reviews' ) ); ?>"><?php esc_html_e( 'All reviews', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
			</div>
		</div>
	</section>
<?php else : ?>
	<?php echo iim_placeholder( __( 'testimonials hidden until permission to publish is ticked on each one', 'iim' ) ); // phpcs:ignore ?>
<?php endif; ?>

<?php // 9. FAQ. ?>
<?php $iim_faqs = iim_faq_posts( array( 'home' => true, 'limit' => 8 ) ); ?>
<?php if ( $iim_faqs ) : ?>
	<section class="section section--surface" aria-labelledby="faq-title">
		<div class="container">
			<div class="section__head section__head--center">
				<p class="eyebrow"><?php esc_html_e( 'FAQ', 'iim' ); ?></p>
				<h2 id="faq-title"><?php esc_html_e( 'Questions people ask before booking', 'iim' ); ?></h2>
			</div>
			<?php get_template_part( 'template-parts/faq', null, array( 'items' => $iim_faqs, 'center' => true ) ); ?>
			<div class="section__foot section__foot--center">
				<a class="link-arrow" href="<?php echo esc_url( iim_page_url( 'faq' ) ); ?>"><?php esc_html_e( 'More answers', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php
// 10. Final CTA.
get_template_part( 'template-parts/cta-band' );
get_footer();
