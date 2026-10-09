<?php
/**
 * Three-step quote form. With JS: one step at a time. Without JS: one long form that posts
 * straight to the REST endpoint, and the server redirects to /thank-you/ or back with errors.
 *
 * Args: heading_level (int), preselect (service slug).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'iim_core_form_state' ) ) {
	echo '<p>' . esc_html__( 'The quote form is temporarily unavailable. Please contact us on WhatsApp or by phone.', 'iim' ) . '</p>';
	return;
}

$iim_state  = iim_core_form_state( 'quote' );
$iim_values = $iim_state['values'] ?? array();
$iim_errors = $iim_state['errors'] ?? array();
$iim_pre    = sanitize_title( $iim_values['service'] ?? ( $args['preselect'] ?? ( isset( $_GET['need'] ) ? wp_unslash( $_GET['need'] ) : '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- read-only preselect, sanitised.
$iim_val    = fn( $k ) => $iim_values[ $k ] ?? '';

/**
 * Field error element. Hidden until the field has an error.
 */
$iim_error = function ( $name ) use ( $iim_errors ) {
	$msg = $iim_errors[ $name ] ?? '';
	printf(
		'<p class="field__error" id="err-%1$s">%2$s<span>%3$s</span></p>',
		esc_attr( $name ),
		iim_icon( 'triangle-alert' ), // phpcs:ignore
		esc_html( $msg )
	);
};
$iim_cls   = fn( $name ) => 'field' . ( isset( $iim_errors[ $name ] ) ? ' has-error' : '' );
$iim_inv   = fn( $name ) => isset( $iim_errors[ $name ] ) ? ' aria-invalid="true"' : '';

$iim_i18n = array(
	'required'  => __( 'This field is required.', 'iim' ),
	'choose'    => __( 'Please choose a service.', 'iim' ),
	'phone'     => __( 'Enter a UAE number, for example 050 123 4567.', 'iim' ),
	'email'     => __( 'Enter a valid email address, or leave it empty.', 'iim' ),
	'consent'   => __( 'Please agree so we can contact you about this request.', 'iim' ),
	'date'      => __( 'Choose today or a later date.', 'iim' ),
	'fileType'  => __( 'Photos must be JPG, PNG or WebP.', 'iim' ),
	'fileSize'  => __( 'Each photo must be 8 MB or smaller.', 'iim' ),
	'fileCount' => __( 'You can attach up to 3 photos.', 'iim' ),
	'generic'   => __( 'Something went wrong. Please try again or message us on WhatsApp.', 'iim' ),
	'network'   => __( 'We could not send your request. Check your connection and try again, or message us on WhatsApp.', 'iim' ),
);

$iim_times = array(
	'morning'   => __( 'Morning', 'iim' ),
	'afternoon' => __( 'Afternoon', 'iim' ),
	'evening'   => __( 'Evening', 'iim' ),
	'any'       => __( 'Any time', 'iim' ),
);

$iim_props = array(
	'apartment' => __( 'Apartment', 'iim' ),
	'villa'     => __( 'Villa', 'iim' ),
	'townhouse' => __( 'Townhouse', 'iim' ),
	'office'    => __( 'Office', 'iim' ),
	'retail'    => __( 'Shop or retail unit', 'iim' ),
	'other'     => __( 'Other', 'iim' ),
);
?>
<form class="quote-form" id="quote-form" method="post" enctype="multipart/form-data"
	action="<?php echo esc_url( rest_url( 'iim/v1/lead' ) ); ?>"
	data-iim-form data-steps="true"
	data-token-url="<?php echo esc_url( rest_url( 'iim/v1/form-token' ) ); ?>"
	data-sitekey="<?php echo esc_attr( defined( 'IIM_TURNSTILE_SITE_KEY' ) ? IIM_TURNSTILE_SITE_KEY : '' ); ?>"
	data-i18n="<?php echo esc_attr( wp_json_encode( $iim_i18n ) ); ?>">

	<?php get_template_part( 'template-parts/form-common', null, array( 'form_type' => 'quote', 'state' => $iim_state ) ); ?>

	<ol class="form-progress" aria-label="<?php esc_attr_e( 'Form progress', 'iim' ); ?>">
		<li aria-current="step"><?php esc_html_e( 'The job', 'iim' ); ?></li>
		<li><?php esc_html_e( 'Where and when', 'iim' ); ?></li>
		<li><?php esc_html_e( 'Your details', 'iim' ); ?></li>
	</ol>

	<fieldset class="form-step is-active" data-step="1">
		<legend><?php esc_html_e( '1. What do you need?', 'iim' ); ?></legend>

		<fieldset class="<?php echo esc_attr( $iim_cls( 'service' ) ); ?>">
			<legend class="field__label"><?php esc_html_e( 'Service', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></legend>
			<div class="choice-grid choice-grid--3">
				<?php foreach ( iim_services() as $iim_i => $iim_service ) : ?>
					<label class="choice">
						<input type="radio" name="service" value="<?php echo esc_attr( $iim_service->post_name ); ?>" required aria-describedby="err-service"<?php checked( $iim_pre, $iim_service->post_name ); ?>>
						<?php echo iim_icon( iim_service_icon( $iim_service->ID ) ); // phpcs:ignore ?>
						<span><?php echo esc_html( get_the_title( $iim_service ) ); ?></span>
					</label>
				<?php endforeach; ?>
				<label class="choice">
					<input type="radio" name="service" value="other" required aria-describedby="err-service"<?php checked( $iim_pre, 'other' ); ?>>
					<?php echo iim_icon( 'clipboard-list' ); // phpcs:ignore ?>
					<span><?php esc_html_e( 'Something else', 'iim' ); ?></span>
				</label>
			</div>
			<?php $iim_error( 'service' ); ?>
		</fieldset>

		<div class="<?php echo esc_attr( $iim_cls( 'issue' ) ); ?>">
			<label class="field__label" for="q-issue"><?php esc_html_e( 'Describe the job', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
			<p class="field__hint" id="q-issue-hint"><?php esc_html_e( 'For example: "Kitchen sink leaking under the cabinet since yesterday" or "Need six ceiling lights changed in a villa".', 'iim' ); ?></p>
			<textarea class="textarea" id="q-issue" name="issue" required maxlength="2000" aria-describedby="q-issue-hint err-issue"<?php echo $iim_inv( 'issue' ); // phpcs:ignore ?>><?php echo esc_textarea( $iim_val( 'issue' ) ); ?></textarea>
			<?php $iim_error( 'issue' ); ?>
		</div>

		<div class="<?php echo esc_attr( $iim_cls( 'photos' ) ); ?>">
			<label class="field__label" for="q-photos"><?php esc_html_e( 'Photos of the issue', 'iim' ); ?> <span class="opt"><?php esc_html_e( '(optional, up to 3)', 'iim' ); ?></span></label>
			<div class="file-drop">
				<?php echo iim_icon( 'camera' ); // phpcs:ignore ?>
				<input type="file" id="q-photos" name="photos[]" accept="image/jpeg,image/png,image/webp" multiple data-max-files="3" data-max-mb="8" aria-describedby="q-photos-hint err-photos">
				<p class="field__hint" id="q-photos-hint"><?php esc_html_e( 'JPG, PNG or WebP, up to 8 MB each. Photos help us bring the right parts.', 'iim' ); ?></p>
				<ul class="file-list" aria-live="polite"></ul>
			</div>
			<?php $iim_error( 'photos' ); ?>
		</div>
	</fieldset>

	<fieldset class="form-step" data-step="2">
		<legend><?php esc_html_e( '2. Where and when?', 'iim' ); ?></legend>
		<div class="form-grid form-grid--2">
			<div class="<?php echo esc_attr( $iim_cls( 'location' ) ); ?> field--full">
				<label class="field__label" for="q-location"><?php esc_html_e( 'Area or building in Dubai', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
				<input class="input" type="text" id="q-location" name="location" required maxlength="200" autocomplete="address-level2" aria-describedby="err-location" value="<?php echo esc_attr( $iim_val( 'location' ) ); ?>"<?php echo $iim_inv( 'location' ); // phpcs:ignore ?>>
				<?php $iim_error( 'location' ); ?>
			</div>
			<div class="<?php echo esc_attr( $iim_cls( 'property_type' ) ); ?>">
				<label class="field__label" for="q-property"><?php esc_html_e( 'Property type', 'iim' ); ?> <span class="opt"><?php esc_html_e( '(optional)', 'iim' ); ?></span></label>
				<select class="select" id="q-property" name="property_type" aria-describedby="err-property_type">
					<option value=""><?php esc_html_e( 'Choose…', 'iim' ); ?></option>
					<?php foreach ( $iim_props as $iim_k => $iim_label ) : ?>
						<option value="<?php echo esc_attr( $iim_k ); ?>"<?php selected( $iim_val( 'property_type' ), $iim_k ); ?>><?php echo esc_html( $iim_label ); ?></option>
					<?php endforeach; ?>
				</select>
				<?php $iim_error( 'property_type' ); ?>
			</div>
			<div class="<?php echo esc_attr( $iim_cls( 'preferred_date' ) ); ?>">
				<label class="field__label" for="q-date"><?php esc_html_e( 'Preferred date', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
				<input class="input" type="date" id="q-date" name="preferred_date" required min="<?php echo esc_attr( wp_date( 'Y-m-d' ) ); ?>" aria-describedby="err-preferred_date" value="<?php echo esc_attr( $iim_val( 'preferred_date' ) ); ?>"<?php echo $iim_inv( 'preferred_date' ); // phpcs:ignore ?>>
				<?php $iim_error( 'preferred_date' ); ?>
			</div>
			<fieldset class="<?php echo esc_attr( $iim_cls( 'preferred_time' ) ); ?> field--full">
				<legend class="field__label"><?php esc_html_e( 'Preferred time', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></legend>
				<div class="choice-grid">
					<?php foreach ( $iim_times as $iim_k => $iim_label ) : ?>
						<label class="choice">
							<input type="radio" name="preferred_time" value="<?php echo esc_attr( $iim_k ); ?>" required aria-describedby="err-preferred_time"<?php checked( $iim_val( 'preferred_time' ) ?: 'any', $iim_k ); ?>>
							<span><?php echo esc_html( $iim_label ); ?></span>
						</label>
					<?php endforeach; ?>
				</div>
				<?php $iim_error( 'preferred_time' ); ?>
			</fieldset>
		</div>
	</fieldset>

	<fieldset class="form-step" data-step="3">
		<legend><?php esc_html_e( '3. Your details', 'iim' ); ?></legend>
		<div class="form-grid form-grid--2">
			<div class="<?php echo esc_attr( $iim_cls( 'name' ) ); ?> field--full">
				<label class="field__label" for="q-name"><?php esc_html_e( 'Full name', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
				<input class="input" type="text" id="q-name" name="name" required maxlength="100" autocomplete="name" aria-describedby="err-name" value="<?php echo esc_attr( $iim_val( 'name' ) ); ?>"<?php echo $iim_inv( 'name' ); // phpcs:ignore ?>>
				<?php $iim_error( 'name' ); ?>
			</div>
			<div class="<?php echo esc_attr( $iim_cls( 'phone' ) ); ?>">
				<label class="field__label" for="q-phone"><?php esc_html_e( 'Mobile number', 'iim' ); ?> <span class="req" aria-hidden="true">*</span></label>
				<input class="input" type="tel" id="q-phone" name="phone" required maxlength="20" inputmode="tel" autocomplete="tel" placeholder="050 123 4567" data-validate="phone" pattern="[0-9+\s\-()]{9,20}" aria-describedby="q-phone-hint err-phone" value="<?php echo esc_attr( $iim_val( 'phone' ) ); ?>"<?php echo $iim_inv( 'phone' ); // phpcs:ignore ?>>
				<p class="field__hint" id="q-phone-hint"><?php esc_html_e( 'UAE number. We use it to confirm your visit.', 'iim' ); ?></p>
				<?php $iim_error( 'phone' ); ?>
			</div>
			<div class="<?php echo esc_attr( $iim_cls( 'email' ) ); ?>">
				<label class="field__label" for="q-email"><?php esc_html_e( 'Email', 'iim' ); ?> <span class="opt"><?php esc_html_e( '(optional, for a written confirmation)', 'iim' ); ?></span></label>
				<input class="input" type="email" id="q-email" name="email" maxlength="150" autocomplete="email" data-validate="email" aria-describedby="err-email" value="<?php echo esc_attr( $iim_val( 'email' ) ); ?>"<?php echo $iim_inv( 'email' ); // phpcs:ignore ?>>
				<?php $iim_error( 'email' ); ?>
			</div>
			<div class="<?php echo esc_attr( $iim_cls( 'consent' ) ); ?> field--full">
				<label class="check">
					<input type="checkbox" name="consent" value="1" required aria-describedby="err-consent"<?php checked( $iim_val( 'consent' ), '1' ); ?>>
					<span>
						<?php
						printf(
							/* translators: %s: privacy policy link. */
							esc_html__( 'I agree that IIM Technical Services may contact me by phone, WhatsApp or email about this request and store my details as described in the %s.', 'iim' ),
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
		</div>
	</fieldset>

	<div class="form-nav">
		<button class="btn btn--secondary" type="button" data-prev hidden><?php echo iim_icon( 'chevron-left' ); // phpcs:ignore ?><?php esc_html_e( 'Back', 'iim' ); ?></button>
		<button class="btn btn--primary" type="button" data-next><?php esc_html_e( 'Continue', 'iim' ); ?><?php echo iim_icon( 'chevron-right' ); // phpcs:ignore ?></button>
		<button class="btn btn--primary" type="submit" hidden><?php esc_html_e( 'Send my request', 'iim' ); ?></button>
	</div>

	<div class="form-submit-nojs">
		<button class="btn btn--primary btn--block" type="submit"><?php esc_html_e( 'Send my request', 'iim' ); ?></button>
	</div>
</form>
