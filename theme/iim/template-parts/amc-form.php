<?php
/**
 * Short annual maintenance contract application: name, phone, emirate, location, property type.
 * Feeds the same lead pipeline as the quote form.
 *
 * Args: plan ('residential'|'commercial'|''), id_prefix (string), heading (string).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'iim_core_form_state' ) ) {
	return;
}

$iim_prefix = sanitize_key( $args['id_prefix'] ?? 'amc' );
$iim_plan   = $args['plan'] ?? '';
$iim_state  = iim_core_form_state( 'amc' );
$iim_values = $iim_state['values'] ?? array();
$iim_errors = $iim_state['errors'] ?? array();
$iim_val    = fn( $k ) => $iim_values[ $k ] ?? '';
$iim_cls    = fn( $name ) => 'field' . ( isset( $iim_errors[ $name ] ) ? ' has-error' : '' );
$iim_error  = function ( $name ) use ( $iim_errors, $iim_prefix ) {
	printf(
		'<p class="field__error" id="%1$s-err-%2$s">%3$s<span>%4$s</span></p>',
		esc_attr( $iim_prefix ),
		esc_attr( $name ),
		iim_icon( 'triangle-alert' ), // phpcs:ignore
		esc_html( $iim_errors[ $name ] ?? '' )
	);
};

$iim_emirates = array(
	'dubai'          => __( 'Dubai', 'iim' ),
	'sharjah'        => __( 'Sharjah', 'iim' ),
	'abu-dhabi'      => __( 'Abu Dhabi', 'iim' ),
	'ajman'          => __( 'Ajman', 'iim' ),
	'umm-al-quwain'  => __( 'Umm Al Quwain', 'iim' ),
	'ras-al-khaimah' => __( 'Ras Al Khaimah', 'iim' ),
	'fujairah'       => __( 'Fujairah', 'iim' ),
);

$iim_props = 'commercial' === $iim_plan
	? array(
		'office'   => __( 'Office', 'iim' ),
		'retail'   => __( 'Shop or retail unit', 'iim' ),
		'building' => __( 'Whole building', 'iim' ),
		'other'    => __( 'Other', 'iim' ),
	)
	: array(
		'apartment' => __( 'Apartment', 'iim' ),
		'villa'     => __( 'Villa', 'iim' ),
		'townhouse' => __( 'Townhouse', 'iim' ),
		'office'    => __( 'Office', 'iim' ),
		'retail'    => __( 'Shop or retail unit', 'iim' ),
		'building'  => __( 'Whole building', 'iim' ),
	);

$iim_i18n = array(
	'required' => __( 'This field is required.', 'iim' ),
	'phone'    => __( 'Enter a UAE number, for example 050 123 4567.', 'iim' ),
	'consent'  => __( 'Please agree so we can contact you about this request.', 'iim' ),
	'generic'  => __( 'Something went wrong. Please try again or message us on WhatsApp.', 'iim' ),
	'network'  => __( 'We could not send your request. Check your connection and try again, or message us on WhatsApp.', 'iim' ),
);
?>
<form class="amc-form" method="post"
	action="<?php echo esc_url( rest_url( 'iim/v1/lead' ) ); ?>"
	data-iim-form
	data-token-url="<?php echo esc_url( rest_url( 'iim/v1/form-token' ) ); ?>"
	data-sitekey="<?php echo esc_attr( defined( 'IIM_TURNSTILE_SITE_KEY' ) ? IIM_TURNSTILE_SITE_KEY : '' ); ?>"
	data-i18n="<?php echo esc_attr( wp_json_encode( $iim_i18n ) ); ?>">

	<?php get_template_part( 'template-parts/form-common', null, array( 'form_type' => 'amc', 'state' => $iim_state ) ); ?>
	<input type="hidden" name="plan" value="<?php echo esc_attr( $iim_plan ); ?>">

	<div class="form-grid form-grid--2">
		<div class="<?php echo esc_attr( $iim_cls( 'name' ) ); ?> field--full">
			<label class="field__label" for="<?php echo esc_attr( $iim_prefix ); ?>-name"><?php esc_html_e( 'Full name', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<input class="input" type="text" id="<?php echo esc_attr( $iim_prefix ); ?>-name" name="name" required maxlength="100" autocomplete="name" aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-name" value="<?php echo esc_attr( $iim_val( 'name' ) ); ?>">
			<?php $iim_error( 'name' ); ?>
		</div>
		<div class="<?php echo esc_attr( $iim_cls( 'phone' ) ); ?>">
			<label class="field__label" for="<?php echo esc_attr( $iim_prefix ); ?>-phone"><?php esc_html_e( 'Mobile number', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<input class="input" type="tel" id="<?php echo esc_attr( $iim_prefix ); ?>-phone" name="phone" required maxlength="20" inputmode="tel" autocomplete="tel" placeholder="050 123 4567" data-validate="phone" pattern="[0-9+\s\-()]{9,20}" aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-phone" value="<?php echo esc_attr( $iim_val( 'phone' ) ); ?>">
			<?php $iim_error( 'phone' ); ?>
		</div>
		<div class="<?php echo esc_attr( $iim_cls( 'emirate' ) ); ?>">
			<label class="field__label" for="<?php echo esc_attr( $iim_prefix ); ?>-emirate"><?php esc_html_e( 'Emirate', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<select class="select" id="<?php echo esc_attr( $iim_prefix ); ?>-emirate" name="emirate" required aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-emirate">
				<?php foreach ( $iim_emirates as $iim_k => $iim_label ) : ?>
					<option value="<?php echo esc_attr( $iim_k ); ?>"<?php selected( $iim_val( 'emirate' ) ?: 'dubai', $iim_k ); ?>><?php echo esc_html( $iim_label ); ?></option>
				<?php endforeach; ?>
			</select>
			<?php $iim_error( 'emirate' ); ?>
		</div>
		<div class="<?php echo esc_attr( $iim_cls( 'location' ) ); ?>">
			<label class="field__label" for="<?php echo esc_attr( $iim_prefix ); ?>-location"><?php esc_html_e( 'Area or building', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<input class="input" type="text" id="<?php echo esc_attr( $iim_prefix ); ?>-location" name="location" required maxlength="200" aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-location" value="<?php echo esc_attr( $iim_val( 'location' ) ); ?>">
			<?php $iim_error( 'location' ); ?>
		</div>
		<div class="<?php echo esc_attr( $iim_cls( 'property_type' ) ); ?>">
			<label class="field__label" for="<?php echo esc_attr( $iim_prefix ); ?>-property"><?php esc_html_e( 'Property type', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<select class="select" id="<?php echo esc_attr( $iim_prefix ); ?>-property" name="property_type" required aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-property_type">
				<option value=""><?php esc_html_e( 'Choose…', 'iim' ); ?></option>
				<?php foreach ( $iim_props as $iim_k => $iim_label ) : ?>
					<option value="<?php echo esc_attr( $iim_k ); ?>"<?php selected( $iim_val( 'property_type' ), $iim_k ); ?>><?php echo esc_html( $iim_label ); ?></option>
				<?php endforeach; ?>
			</select>
			<?php $iim_error( 'property_type' ); ?>
		</div>
		<div class="<?php echo esc_attr( $iim_cls( 'consent' ) ); ?> field--full">
			<label class="check">
				<input type="checkbox" name="consent" value="1" required aria-describedby="<?php echo esc_attr( $iim_prefix ); ?>-err-consent">
				<span>
					<?php
					printf(
						/* translators: %s: privacy policy link. */
						esc_html__( 'I agree to be contacted about an annual contract and to my details being stored as described in the %s.', 'iim' ),
						'<a href="' . esc_url( iim_page_url( 'privacy-policy' ) ) . '">' . esc_html__( 'privacy policy', 'iim' ) . '</a>'
					);
					?>
				</span>
			</label>
			<?php $iim_error( 'consent' ); ?>
		</div>
		<div class="field field--full">
			<?php if ( defined( 'IIM_TURNSTILE_SITE_KEY' ) && IIM_TURNSTILE_SITE_KEY ) : ?>
					<div class="cf-turnstile" aria-label="<?php esc_attr_e( 'Spam check', 'iim' ); ?>"></div>
				<?php endif; ?>
		</div>
		<div class="field field--full">
			<button class="btn btn--primary btn--block" type="submit"><?php esc_html_e( 'Apply for a contract', 'iim' ); ?></button>
		</div>
	</div>
</form>
