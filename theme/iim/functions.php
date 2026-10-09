<?php
/**
 * Theme bootstrap only. All logic lives in /inc.
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

define( 'IIM_THEME_VERSION', '1.0.0' );
define( 'IIM_THEME_DIR', get_template_directory() );
define( 'IIM_THEME_URI', get_template_directory_uri() );

foreach ( array( 'helpers', 'setup', 'templates', 'enqueue', 'performance', 'security', 'acf', 'nav', 'schema-hooks' ) as $iim_file ) {
	require_once IIM_THEME_DIR . '/inc/' . $iim_file . '.php';
}
unset( $iim_file );
