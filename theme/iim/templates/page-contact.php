<?php
/**
 * Template Name: Contact
 *
 * Every detail comes from Business Info, so it always matches the footer, schema and Google profile.
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
			'eyebrow' => __( 'Contact', 'iim' ),
			'lead'    => iim_field( 'hero_subhead', get_the_ID(), __( 'Call, WhatsApp or email us. For the fastest reply, send a photo of the issue on WhatsApp.', 'iim' ) ),
		)
	);
endwhile;

$iim_email = iim_opt( 'email' );
$iim_hours = (array) iim_opt( 'opening_hours', array() );
?>
<section class="section" data-track-zone="contact">
	<div class="container">
		<div class="split">
			<div class="stack stack--lg">
				<ul class="contact-list">
					<?php if ( iim_tel_href() ) : ?>
						<li><span class="icon-tile"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?></span><span><?php esc_html_e( 'Phone', 'iim' ); ?><br><a href="<?php echo esc_url( iim_tel_href() ); ?>"><?php echo esc_html( iim_phone_display() ); ?></a></span></li>
					<?php endif; ?>
					<?php if ( iim_wa_href() ) : ?>
						<li><span class="icon-tile"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?></span><span><?php esc_html_e( 'WhatsApp', 'iim' ); ?><br><a href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Start a chat', 'iim' ); ?></a></span></li>
					<?php endif; ?>
					<?php if ( $iim_email ) : ?>
						<li><span class="icon-tile"><?php echo iim_icon( 'mail' ); // phpcs:ignore ?></span><span><?php esc_html_e( 'Email', 'iim' ); ?><br><a href="<?php echo esc_url( 'mailto:' . antispambot( $iim_email ) ); ?>"><?php echo esc_html( antispambot( $iim_email ) ); ?></a></span></li>
					<?php endif; ?>
					<li><span class="icon-tile"><?php echo iim_icon( 'map-pin' ); // phpcs:ignore ?></span><span><?php esc_html_e( 'Address', 'iim' ); ?><br><?php echo esc_html( iim_address_line() ); ?></span></li>
					<?php if ( iim_opt( 'hours_text' ) ) : ?>
						<li><span class="icon-tile"><?php echo iim_icon( 'clock' ); // phpcs:ignore ?></span><span><?php esc_html_e( 'Hours', 'iim' ); ?><br><?php echo esc_html( iim_opt( 'hours_text' ) ); ?></span></li>
					<?php else : ?>
						<?php echo iim_placeholder( __( 'working hours', 'iim' ) ); // phpcs:ignore ?>
					<?php endif; ?>
				</ul>
				<?php if ( iim_opt( 'gbp_url' ) ) : ?>
					<a class="link-arrow" href="<?php echo esc_url( iim_opt( 'gbp_url' ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Find us on Google Maps', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
				<?php endif; ?>
			</div>
			<div class="form-panel">
				<h2><?php esc_html_e( 'Request a quote', 'iim' ); ?></h2>
				<p class="muted"><?php esc_html_e( 'Three short steps. We reply to confirm the visit.', 'iim' ); ?></p>
				<?php get_template_part( 'template-parts/quote-form' ); ?>
			</div>
		</div>
	</div>
</section>
<?php
get_footer();
