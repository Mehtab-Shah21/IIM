<?php
/**
 * Hidden anti-spam fields and the alert box shared by both forms.
 * Server-side checks: nonce, signed time token (minimum fill time), honeypot, Turnstile, rate limit.
 *
 * Args: form_type ('quote'|'amc').
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_state = $args['state'] ?? array();
?>
<input type="hidden" name="form_type" value="<?php echo esc_attr( $args['form_type'] ?? 'quote' ); ?>">
<input type="hidden" name="_iim_nonce" value="<?php echo esc_attr( wp_create_nonce( 'iim_lead' ) ); ?>">
<input type="hidden" name="_iim_token" value="<?php echo esc_attr( function_exists( 'iim_core_form_token' ) ? iim_core_form_token() : '' ); ?>">
<input type="hidden" name="_iim_js" value="0">
<input type="hidden" name="page_url" value="<?php echo esc_url( get_permalink() ?: home_url( add_query_arg( array() ) ) ); ?>">
<div class="hp-field" aria-hidden="true">
	<label for="<?php echo esc_attr( ( $args['form_type'] ?? 'quote' ) . '-website' ); ?>"><?php esc_html_e( 'Leave this field empty', 'iim' ); ?></label>
	<input type="text" id="<?php echo esc_attr( ( $args['form_type'] ?? 'quote' ) . '-website' ); ?>" name="company_website" tabindex="-1" autocomplete="off">
</div>
<div class="form-alert form-alert--error" role="alert" tabindex="-1" data-form-alert<?php echo empty( $iim_state['message'] ) ? ' hidden' : ''; ?>>
	<?php echo iim_icon( 'triangle-alert' ); // phpcs:ignore ?>
	<span><?php echo esc_html( $iim_state['message'] ?? '' ); ?></span>
</div>
