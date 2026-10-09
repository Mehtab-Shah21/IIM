<?php
/**
 * Footer: brand, services, areas, contact, licence, real social links only, legal, copyright.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_name    = iim_opt( 'business_name', get_bloginfo( 'name' ) );
$iim_socials = array_filter(
	(array) iim_opt( 'socials', array() ),
	fn( $s ) => ! empty( $s['url'] ) && ! preg_match( '#(wix\.com|/wix\b|yelp\.com/?$)#i', $s['url'] )
);
$iim_areas   = post_type_exists( 'area' ) ? get_posts( array( 'post_type' => 'area', 'posts_per_page' => 8, 'orderby' => 'menu_order title', 'order' => 'ASC', 'no_found_rows' => true ) ) : array();
$iim_email   = iim_opt( 'email' );
$iim_licence = iim_opt( 'license_number' );
?>
<footer class="site-footer" data-track-zone="footer">
	<div class="container">
		<div class="footer-grid">
			<div class="footer-brand">
				<?php get_template_part( 'template-parts/logo' ); ?>
				<p><?php echo esc_html( iim_opt( 'footer_description', __( 'Electrical, plumbing, AC, painting, handyman and renovation services for homes and businesses across Dubai.', 'iim' ) ) ); ?></p>
				<?php if ( $iim_licence ) : ?>
					<p>
						<?php
						/* translators: 1: licence number, 2: issuing authority. */
						echo esc_html( sprintf( __( 'Trade licence %1$s %2$s', 'iim' ), $iim_licence, iim_opt( 'license_authority' ) ? '(' . iim_opt( 'license_authority' ) . ')' : '' ) );
						?>
					</p>
				<?php else : ?>
					<?php echo iim_placeholder( __( 'trade licence number', 'iim' ) ); // phpcs:ignore ?>
				<?php endif; ?>
				<?php if ( $iim_socials ) : ?>
					<ul class="social-list">
						<?php foreach ( $iim_socials as $iim_social ) : ?>
							<li><a href="<?php echo esc_url( $iim_social['url'] ); ?>" target="_blank" rel="noopener me"><?php echo esc_html( ucfirst( $iim_social['network'] ?? __( 'Profile', 'iim' ) ) ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>

			<div>
				<h2><?php esc_html_e( 'Services', 'iim' ); ?></h2>
				<ul class="footer-list">
					<?php foreach ( iim_services() as $iim_service ) : ?>
						<li><a href="<?php echo esc_url( get_permalink( $iim_service ) ); ?>"><?php echo esc_html( get_the_title( $iim_service ) ); ?></a></li>
					<?php endforeach; ?>
					<li><a href="<?php echo esc_url( iim_page_url( 'annual-maintenance-contract' ) ); ?>"><?php esc_html_e( 'Annual Maintenance Contract', 'iim' ); ?></a></li>
				</ul>
			</div>

			<div>
				<h2><?php esc_html_e( 'Areas', 'iim' ); ?></h2>
				<ul class="footer-list">
					<?php foreach ( $iim_areas as $iim_area ) : ?>
						<li><a href="<?php echo esc_url( get_permalink( $iim_area ) ); ?>"><?php echo esc_html( get_the_title( $iim_area ) ); ?></a></li>
					<?php endforeach; ?>
					<li><a href="<?php echo esc_url( post_type_exists( 'area' ) ? get_post_type_archive_link( 'area' ) : home_url( '/areas/' ) ); ?>"><?php esc_html_e( 'All areas in Dubai', 'iim' ); ?></a></li>
				</ul>
			</div>

			<div>
				<h2><?php esc_html_e( 'Contact', 'iim' ); ?></h2>
				<ul class="footer-list">
					<?php if ( iim_tel_href() ) : ?>
						<li><a href="<?php echo esc_url( iim_tel_href() ); ?>"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( iim_phone_display() ); ?></a></li>
					<?php endif; ?>
					<?php if ( iim_wa_href() ) : ?>
						<li><a href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp', 'iim' ); ?></a></li>
					<?php endif; ?>
					<?php if ( $iim_email ) : ?>
						<li><a href="<?php echo esc_url( 'mailto:' . antispambot( $iim_email ) ); ?>"><?php echo iim_icon( 'mail' ); // phpcs:ignore ?><?php echo esc_html( antispambot( $iim_email ) ); ?></a></li>
					<?php endif; ?>
					<li><span class="footer-list__address"><?php echo esc_html( iim_address_line() ); ?></span></li>
					<?php if ( iim_opt( 'hours_text' ) ) : ?>
						<li><?php echo esc_html( iim_opt( 'hours_text' ) ); ?></li>
					<?php endif; ?>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<p>
				<?php
				/* translators: 1: year, 2: business name. */
				echo esc_html( sprintf( __( '© %1$s %2$s. All rights reserved.', 'iim' ), wp_date( 'Y' ), iim_opt( 'legal_name', $iim_name ) ) );
				?>
			</p>
			<ul>
				<li><a href="<?php echo esc_url( iim_page_url( 'privacy-policy' ) ); ?>"><?php esc_html_e( 'Privacy Policy', 'iim' ); ?></a></li>
				<li><a href="<?php echo esc_url( iim_page_url( 'terms' ) ); ?>"><?php esc_html_e( 'Terms', 'iim' ); ?></a></li>
				<li><a href="<?php echo esc_url( iim_page_url( 'accessibility' ) ); ?>"><?php esc_html_e( 'Accessibility', 'iim' ); ?></a></li>
			</ul>
		</div>
	</div>
</footer>
