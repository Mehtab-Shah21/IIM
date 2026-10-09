<?php
/**
 * Sticky header with mega menu, and the mobile drawer.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_services = iim_services();
$iim_tel      = iim_tel_href();
?>
<header class="site-header" data-track-zone="header">
	<div class="container container--wide site-header__inner">
		<?php get_template_part( 'template-parts/logo' ); ?>

		<nav class="primary-nav" aria-label="<?php esc_attr_e( 'Primary', 'iim' ); ?>">
			<ul class="primary-nav__list">
				<?php foreach ( iim_primary_nav() as $iim_item ) : ?>
					<?php $iim_has_mega = 'services' === $iim_item['key'] && $iim_services; ?>
					<li class="primary-nav__item<?php echo $iim_has_mega ? ' has-mega' : ''; ?>">
						<a class="primary-nav__link" href="<?php echo esc_url( $iim_item['url'] ); ?>"<?php echo iim_nav_is_current( $iim_item['key'] ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $iim_item['label'] ); ?></a>
						<?php if ( $iim_has_mega ) : ?>
							<button class="primary-nav__toggle" type="button" aria-expanded="false" aria-controls="mega-services" data-mega-toggle>
								<?php echo iim_icon( 'chevron-down' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<span class="screen-reader-text"><?php esc_html_e( 'Show services', 'iim' ); ?></span>
							</button>
							<div class="mega" id="mega-services">
								<div class="container container--wide">
									<ul class="mega__grid" role="list">
										<?php foreach ( $iim_services as $iim_service ) : ?>
											<li>
												<a class="mega__link" href="<?php echo esc_url( get_permalink( $iim_service ) ); ?>">
													<span class="icon-tile"><?php echo iim_icon( iim_service_icon( $iim_service->ID ) ); // phpcs:ignore ?></span>
													<span>
														<strong><?php echo esc_html( get_the_title( $iim_service ) ); ?></strong>
														<span><?php echo esc_html( iim_field( 'menu_summary', $iim_service->ID ) ); ?></span>
													</span>
												</a>
											</li>
										<?php endforeach; ?>
										<li class="mega__all">
											<a class="link-arrow" href="<?php echo esc_url( $iim_item['url'] ); ?>"><?php esc_html_e( 'All services', 'iim' ); ?> <?php echo iim_icon( 'arrow-right' ); // phpcs:ignore ?></a>
										</li>
									</ul>
								</div>
							</div>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</nav>

		<div class="site-header__actions">
			<?php if ( $iim_tel ) : ?>
				<a class="btn btn--secondary site-header__call" href="<?php echo esc_url( $iim_tel ); ?>">
					<?php echo iim_icon( 'phone' ); // phpcs:ignore ?>
					<span class="btn__label"><?php echo esc_html( iim_phone_display() ); ?></span>
					<span class="screen-reader-text"><?php esc_html_e( '(call us)', 'iim' ); ?></span>
				</a>
			<?php endif; ?>
			<a class="btn btn--primary site-header__quote" href="<?php echo esc_url( iim_quote_url() ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
			<a class="menu-toggle" href="#drawer">
				<?php echo iim_icon( 'menu' ); // phpcs:ignore ?>
				<span class="screen-reader-text"><?php esc_html_e( 'Open menu', 'iim' ); ?></span>
			</a>
		</div>
	</div>
</header>

<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Menu', 'iim' ); ?>" data-track-zone="drawer">
	<a class="drawer__scrim" href="#" data-drawer-close tabindex="-1" aria-hidden="true"></a>
	<div class="drawer__panel">
		<div class="drawer__head">
			<?php get_template_part( 'template-parts/logo' ); ?>
			<a class="drawer__close" href="#" data-drawer-close>
				<?php echo iim_icon( 'x' ); // phpcs:ignore ?>
				<span class="screen-reader-text"><?php esc_html_e( 'Close menu', 'iim' ); ?></span>
			</a>
		</div>
		<nav class="drawer__nav" aria-label="<?php esc_attr_e( 'Mobile', 'iim' ); ?>">
			<ul class="drawer__list">
				<?php foreach ( iim_primary_nav() as $iim_item ) : ?>
					<li>
						<a href="<?php echo esc_url( $iim_item['url'] ); ?>"<?php echo iim_nav_is_current( $iim_item['key'] ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $iim_item['label'] ); ?></a>
						<?php if ( 'services' === $iim_item['key'] && $iim_services ) : ?>
							<ul class="drawer__sublist">
								<?php foreach ( $iim_services as $iim_service ) : ?>
									<li><a href="<?php echo esc_url( get_permalink( $iim_service ) ); ?>"><?php echo iim_icon( iim_service_icon( $iim_service->ID ), 'icon--sm' ); // phpcs:ignore ?><?php echo esc_html( get_the_title( $iim_service ) ); ?></a></li>
								<?php endforeach; ?>
							</ul>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<div class="drawer__foot">
			<a class="btn btn--primary btn--block" href="<?php echo esc_url( iim_quote_url() ); ?>"><?php esc_html_e( 'Get a Quote', 'iim' ); ?></a>
			<?php if ( iim_wa_href() ) : ?>
				<a class="btn btn--whatsapp btn--block" href="<?php echo esc_url( iim_wa_href() ); ?>" target="_blank" rel="noopener"><?php echo iim_icon( 'whatsapp' ); // phpcs:ignore ?><?php esc_html_e( 'WhatsApp Us', 'iim' ); ?></a>
			<?php endif; ?>
			<?php if ( $iim_tel ) : ?>
				<a class="btn btn--secondary btn--block" href="<?php echo esc_url( $iim_tel ); ?>"><?php echo iim_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( iim_phone_display() ); ?></a>
			<?php endif; ?>
		</div>
	</div>
</div>
