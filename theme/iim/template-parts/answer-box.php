<?php
/**
 * Direct answer (40 to 60 words) at the top of service, area and guide pages, for answer engines.
 *
 * Args: post_id (int).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_answer = iim_field( 'direct_answer', (int) ( $args['post_id'] ?? get_the_ID() ) );
if ( ! $iim_answer ) {
	echo iim_placeholder( __( 'direct-answer summary, 40 to 60 words', 'iim' ) ); // phpcs:ignore
	return;
}
?>
<div class="answer-box">
	<span class="answer-box__label"><?php esc_html_e( 'In short', 'iim' ); ?></span>
	<p><?php echo esc_html( $iim_answer ); ?></p>
</div>
