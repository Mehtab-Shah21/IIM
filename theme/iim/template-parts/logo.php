<?php
/**
 * Logo: the uploaded custom logo, or a text wordmark until the real SVG/PNG is supplied.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_name = iim_opt( 'business_name', get_bloginfo( 'name' ) );

if ( has_custom_logo() ) {
	$iim_logo_id = (int) get_theme_mod( 'custom_logo' );
	printf(
		'<a class="site-logo" href="%1$s" rel="home">%2$s</a>',
		esc_url( home_url( '/' ) ),
		wp_get_attachment_image(
			$iim_logo_id,
			'full',
			false,
			array(
				'alt'           => $iim_name,
				'loading'       => 'eager',
				'fetchpriority' => 'low',
				'class'         => 'custom-logo',
			)
		)
	);
	return;
}
?>
<a class="site-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php echo esc_attr( $iim_name ); ?>">
	<span class="site-logo__mark" aria-hidden="true">IIM</span>
	<span class="site-logo__text" aria-hidden="true"><?php esc_html_e( 'Technical', 'iim' ); ?><br><?php esc_html_e( 'Services', 'iim' ); ?></span>
</a>
