<?php
/**
 * Template Name: Style guide (internal, noindex)
 *
 * Every token and component on one page, so any change can be checked against the system.
 * iim-core sets noindex on pages using this template.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part( 'template-parts/page-hero', null, array( 'title' => __( 'Style guide', 'iim' ), 'lead' => __( 'Internal reference for the IIM design system. Hidden from search.', 'iim' ) ) );

$iim_colors = array( 'navy-900', 'navy-800', 'navy-600', 'navy-100', 'amber-500', 'amber-600', 'amber-100', 'cream', 'neutral-50', 'neutral-100', 'neutral-200', 'neutral-400', 'neutral-600', 'neutral-800', 'success', 'error', 'wa' );
?>
<section class="section">
	<div class="container stack stack--lg">

		<div class="sg-section">
			<h2><?php esc_html_e( 'Colour', 'iim' ); ?></h2>
			<div class="sg-row">
				<?php foreach ( $iim_colors as $iim_c ) : ?>
					<div class="sg-swatch"><span style="background: var(--c-<?php echo esc_attr( $iim_c ); ?>)"></span><code>--c-<?php echo esc_html( $iim_c ); ?></code></div>
				<?php endforeach; ?>
			</div>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Type', 'iim' ); ?></h2>
			<p class="eyebrow">Eyebrow</p>
			<p style="font: var(--fw-extrabold) var(--fs-h1)/var(--lh-heading) var(--font-heading); color: var(--c-heading)">H1 Electrician in Dubai</p>
			<p class="h3" style="font-size: var(--fs-h2); font-family: var(--font-heading); font-weight: var(--fw-bold); color: var(--c-heading)">H2 Book in three steps</p>
			<h3>H3 Card title</h3>
			<p class="lead">Lead paragraph for introductions.</p>
			<p>Body text at the fluid body size with a 1.6 line height, capped at 68 characters for comfortable reading.</p>
			<p class="muted"><small>Small muted text.</small></p>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Spacing', 'iim' ); ?></h2>
			<?php for ( $iim_i = 1; $iim_i <= 10; $iim_i++ ) : ?>
				<div class="sg-row"><code>--space-<?php echo (int) $iim_i; ?></code><span class="sg-space" style="width: var(--space-<?php echo (int) $iim_i; ?>)"></span></div>
			<?php endfor; ?>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Radii and shadows', 'iim' ); ?></h2>
			<div class="sg-row">
				<?php foreach ( array( 'sm', 'md', 'lg', 'pill' ) as $iim_r ) : ?>
					<div class="sg-radius" style="border-radius: var(--radius-<?php echo esc_attr( $iim_r ); ?>)"></div>
				<?php endforeach; ?>
				<?php foreach ( array( 'sm', 'md', 'lg' ) as $iim_s ) : ?>
					<div class="sg-radius" style="box-shadow: var(--shadow-<?php echo esc_attr( $iim_s ); ?>); border-radius: var(--radius-md)"></div>
				<?php endforeach; ?>
			</div>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Buttons', 'iim' ); ?></h2>
			<div class="btn-row">
				<a class="btn btn--primary" href="#">Primary</a>
				<a class="btn btn--secondary" href="#">Secondary</a>
				<a class="btn btn--whatsapp" href="#"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?>WhatsApp</a>
				<button class="btn btn--primary" disabled>Disabled</button>
				<button class="btn btn--primary is-loading">Loading</button>
			</div>
			<div class="cta-band"><h3>Dark surface</h3><div class="btn-row"><a class="btn btn--primary" href="#">Primary</a><a class="btn btn--secondary" href="#">Secondary</a></div></div>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Cards', 'iim' ); ?></h2>
			<div class="cards cards--3">
				<?php foreach ( array_slice( iim_services(), 0, 3 ) as $iim_service ) : ?>
					<?php get_template_part( 'template-parts/service-card', null, array( 'post' => $iim_service ) ); ?>
				<?php endforeach; ?>
			</div>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Form fields', 'iim' ); ?></h2>
			<div class="form-panel form-grid form-grid--2">
				<div class="field"><label class="field__label" for="sg-a">Default</label><input class="input" id="sg-a"></div>
				<div class="field has-error"><label class="field__label" for="sg-b">With error</label><input class="input" id="sg-b" aria-invalid="true" aria-describedby="sg-b-err"><p class="field__error" id="sg-b-err"><?php echo iim_icon( 'triangle-alert' ); // phpcs:ignore ?><span>This field is required.</span></p></div>
				<div class="field"><label class="field__label" for="sg-c">Select</label><select class="select" id="sg-c"><option>Option</option></select></div>
				<div class="field"><label class="field__label" for="sg-d">Textarea</label><textarea class="textarea" id="sg-d"></textarea></div>
				<div class="field field--full"><label class="check"><input type="checkbox"><span>Checkbox with a longer label</span></label></div>
			</div>
		</div>

		<div class="sg-section">
			<h2><?php esc_html_e( 'Content blocks', 'iim' ); ?></h2>
			<div class="answer-box"><span class="answer-box__label">In short</span><p>Direct answer box, 40 to 60 words.</p></div>
			<?php get_template_part( 'template-parts/faq', null, array( 'items' => array( array( 'question' => 'FAQ question?', 'answer' => 'FAQ answer.' ) ) ) ); ?>
			<ul class="chip-list"><li><span class="chip">Chip</span></li><li><span class="badge">Badge</span></li></ul>
		</div>
	</div>
</section>
<?php
get_footer();
