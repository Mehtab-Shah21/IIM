<?php
/**
 * Inner page hero: breadcrumbs, eyebrow, the single H1, lead, optional buttons and meta line.
 *
 * Args: title, eyebrow, lead, buttons (bool or URL), button_label, meta (html string, pre-escaped).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_args = wp_parse_args(
	$args ?? array(),
	array(
		'title'   => get_the_title(),
		'eyebrow' => '',
		'lead'    => '',
		'buttons' => false,
		'meta'    => '',
		'button_label' => '',
	)
);
?>
<section class="page-hero">
	<div class="container">
		<div class="page-hero__inner">
			<?php iim_breadcrumbs(); ?>
			<?php if ( $iim_args['eyebrow'] ) : ?>
				<p class="eyebrow"><?php echo esc_html( $iim_args['eyebrow'] ); ?></p>
			<?php endif; ?>
			<h1><?php echo esc_html( $iim_args['title'] ); ?></h1>
			<?php if ( $iim_args['lead'] ) : ?>
				<p class="lead"><?php echo esc_html( $iim_args['lead'] ); ?></p>
			<?php endif; ?>
			<?php if ( $iim_args['buttons'] ) : ?>
				<div class="btn-row" data-track-zone="page-hero">
					<a class="btn btn--primary" href="<?php echo esc_url( is_string( $iim_args['buttons'] ) ? $iim_args['buttons'] : iim_quote_url() ); ?>"><?php echo esc_html( $iim_args['button_label'] ?: __( 'Get a Quote', 'iim' ) ); ?></a>
					<?php if ( iim_wa_href() ) : ?>
						<a class="btn btn--whatsapp" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
			<?php if ( $iim_args['meta'] ) : ?>
				<div class="meta-line"><?php echo wp_kses_post( $iim_args['meta'] ); ?></div>
			<?php endif; ?>
		</div>
	</div>
</section>
