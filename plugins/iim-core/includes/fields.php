<?php
/**
 * ACF field groups (registered in PHP so they are versioned in Git and survive a theme change).
 *
 * Editors change words and images inside fixed layouts; they cannot change widths, spacing or radii.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Build a field with a stable, unique key.
 *
 * @param string $prefix Key prefix (group or parent field).
 * @param string $name   Field name.
 * @param string $label  Label.
 * @param string $type   ACF type.
 * @param array  $extra  Extra settings.
 */
function iim_core_f( $prefix, $name, $label, $type = 'text', $extra = array() ) {
	return array_merge(
		array(
			'key'   => 'field_iim_' . $prefix . '_' . $name,
			'name'  => $name,
			'label' => $label,
			'type'  => $type,
		),
		$extra
	);
}

/**
 * Tab field.
 *
 * @param string $prefix Prefix.
 * @param string $label  Label.
 */
function iim_core_tab( $prefix, $label ) {
	return array(
		'key'       => 'field_iim_' . $prefix . '_tab_' . sanitize_key( $label ),
		'label'     => $label,
		'type'      => 'tab',
		'placement' => 'top',
	);
}

/**
 * Icons available in the theme sprite (see build.mjs).
 */
function iim_core_icon_choices() {
	$icons = array( 'zap', 'droplets', 'snowflake', 'paint-roller', 'hammer', 'house', 'siren', 'wrench', 'shield-check', 'wallet', 'message-circle', 'calendar-check', 'clock', 'users', 'thumbs-up', 'sparkles', 'building-2', 'badge-check', 'check', 'star', 'camera', 'map-pin' );
	return array_combine( $icons, $icons );
}

add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}


		/*
		 * 1. Business Info (options page).
		 */
		$p = 'opt';
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_business_info',
				'title'    => __( 'Business Info', 'iim-core' ),
				'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'iim-business-info' ) ) ),
				'fields'   => array(
					iim_core_tab( $p, __( 'Contact', 'iim-core' ) ),
					iim_core_f( $p, 'business_name', __( 'Business name', 'iim-core' ), 'text', array( 'required' => 1 ) ),
					iim_core_f( $p, 'legal_name', __( 'Legal name (as on the trade licence)', 'iim-core' ) ),
					iim_core_f( $p, 'phone_display', __( 'Phone (as shown)', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: +971 50 962 6446', 'iim-core' ) ) ),
					iim_core_f( $p, 'phone_e164', __( 'Phone (international format)', 'iim-core' ), 'text', array( 'instructions' => __( 'Used for call links and schema. Example: +971509626446', 'iim-core' ), 'required' => 1 ) ),
					iim_core_f( $p, 'whatsapp_e164', __( 'WhatsApp number (international format)', 'iim-core' ), 'text', array( 'required' => 1 ) ),
					iim_core_f( $p, 'email', __( 'Public email', 'iim-core' ), 'email' ),
					iim_core_f( $p, 'owner_email', __( 'Lead notification emails', 'iim-core' ), 'text', array( 'instructions' => __( 'Who receives every quote request. Separate several addresses with commas.', 'iim-core' ) ) ),
					iim_core_f( $p, 'address_street', __( 'Street address / area', 'iim-core' ), 'text', array( 'instructions' => __( 'Must match the Google Business Profile exactly.', 'iim-core' ) ) ),
					iim_core_f( $p, 'address_locality', __( 'City', 'iim-core' ), 'text', array( 'default_value' => 'Dubai' ) ),
					iim_core_f( $p, 'address_region', __( 'Emirate', 'iim-core' ), 'text', array( 'default_value' => 'Dubai' ) ),
					iim_core_f( $p, 'address_country', __( 'Country code', 'iim-core' ), 'text', array( 'default_value' => 'AE' ) ),
					iim_core_f( $p, 'geo_lat', __( 'Latitude', 'iim-core' ), 'number', array( 'step' => 'any' ) ),
					iim_core_f( $p, 'geo_lng', __( 'Longitude', 'iim-core' ), 'number', array( 'step' => 'any' ) ),
					iim_core_f( $p, 'hours_text', __( 'Working hours (as shown)', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: Every day, 8am to 10pm. Emergency line 24/7.', 'iim-core' ) ) ),
					iim_core_f(
						$p,
						'opening_hours',
						__( 'Working hours (for Google)', 'iim-core' ),
						'repeater',
						array(
							'layout'     => 'table',
							'sub_fields' => array(
								iim_core_f(
									'opt_oh',
									'days',
									__( 'Days', 'iim-core' ),
									'checkbox',
									array(
										'choices' => array( 'Monday' => 'Mon', 'Tuesday' => 'Tue', 'Wednesday' => 'Wed', 'Thursday' => 'Thu', 'Friday' => 'Fri', 'Saturday' => 'Sat', 'Sunday' => 'Sun' ),
										'layout'  => 'horizontal',
									)
								),
								iim_core_f( 'opt_oh', 'opens', __( 'Opens', 'iim-core' ), 'time_picker', array( 'return_format' => 'H:i', 'display_format' => 'H:i' ) ),
								iim_core_f( 'opt_oh', 'closes', __( 'Closes', 'iim-core' ), 'time_picker', array( 'return_format' => 'H:i', 'display_format' => 'H:i' ) ),
							),
						)
					),

					iim_core_tab( $p, __( 'Trust and claims', 'iim-core' ) ),
					iim_core_f( $p, 'trust_note', __( 'Read me', 'iim-core' ), 'message', array( 'message' => __( 'Only switch a claim on once the client has confirmed it in writing. Switched-off claims are never shown to visitors.', 'iim-core' ) ) ),
					iim_core_f( $p, 'license_number', __( 'Trade licence number', 'iim-core' ) ),
					iim_core_f( $p, 'license_authority', __( 'Issuing authority', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: Dubai Department of Economy and Tourism', 'iim-core' ) ) ),
					iim_core_f( $p, 'dewa_show', __( 'Show DEWA compliance claim', 'iim-core' ), 'true_false', array( 'ui' => 1 ) ),
					iim_core_f( $p, 'dewa_short', __( 'DEWA claim (short, for the trust strip)', 'iim-core' ), 'text', array( 'default_value' => 'DEWA-compliant work' ) ),
					iim_core_f( $p, 'dewa_text', __( 'DEWA proof (full text for About page)', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'insurance_text', __( 'Insurance details', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'claim_247', __( 'We offer 24/7 emergency service', 'iim-core' ), 'true_false', array( 'ui' => 1 ) ),
					iim_core_f( $p, 'free_quote', __( 'Quotes are free', 'iim-core' ), 'true_false', array( 'ui' => 1 ) ),
					iim_core_f( $p, 'response_time_text', __( 'Response time statement', 'iim-core' ), 'text', array( 'instructions' => __( 'Only a confirmed, specific statement. Leave empty if not confirmed.', 'iim-core' ) ) ),
					iim_core_f( $p, 'warranty_text', __( 'Workmanship warranty', 'iim-core' ), 'text' ),

					iim_core_tab( $p, __( 'Reviews', 'iim-core' ) ),
					iim_core_f( $p, 'gbp_url', __( 'Google Business Profile link', 'iim-core' ), 'url' ),
					iim_core_f( $p, 'review_url', __( 'Google reviews link', 'iim-core' ), 'url' ),
					iim_core_f( $p, 'rating_show', __( 'Show Google rating', 'iim-core' ), 'true_false', array( 'ui' => 1, 'instructions' => __( 'Only with the real, current rating from Google. Also enables AggregateRating schema on the home and reviews pages.', 'iim-core' ) ) ),
					iim_core_f( $p, 'rating_value', __( 'Rating (out of 5)', 'iim-core' ), 'number', array( 'min' => 1, 'max' => 5, 'step' => 0.1 ) ),
					iim_core_f( $p, 'rating_count', __( 'Number of reviews', 'iim-core' ), 'number', array( 'min' => 0, 'step' => 1 ) ),

					iim_core_tab( $p, __( 'Numbers', 'iim-core' ) ),
					iim_core_f(
						$p,
						'stats',
						__( 'Company numbers', 'iim-core' ),
						'repeater',
						array(
							'instructions' => __( 'Real figures only (jobs completed, years in business, areas served). The section is hidden while empty.', 'iim-core' ),
							'max'          => 4,
							'layout'       => 'table',
							'sub_fields'   => array(
								iim_core_f( 'opt_stat', 'value', __( 'Number', 'iim-core' ), 'number', array( 'min' => 0 ) ),
								iim_core_f( 'opt_stat', 'suffix', __( 'Suffix', 'iim-core' ), 'text', array( 'instructions' => '+', 'maxlength' => 3 ) ),
								iim_core_f( 'opt_stat', 'label', __( 'Label', 'iim-core' ), 'text' ),
							),
						)
					),

					iim_core_tab( $p, __( 'Social', 'iim-core' ) ),
					iim_core_f(
						$p,
						'socials',
						__( 'Social profiles', 'iim-core' ),
						'repeater',
						array(
							'instructions' => __( 'Real company profiles only. Also used as sameAs in schema.', 'iim-core' ),
							'layout'       => 'table',
							'sub_fields'   => array(
								iim_core_f( 'opt_soc', 'network', __( 'Network', 'iim-core' ), 'select', array( 'choices' => array( 'facebook' => 'Facebook', 'instagram' => 'Instagram', 'linkedin' => 'LinkedIn', 'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'x' => 'X' ) ) ),
								iim_core_f( 'opt_soc', 'url', __( 'URL', 'iim-core' ), 'url' ),
							),
						)
					),

					iim_core_tab( $p, __( 'Messages and prices', 'iim-core' ) ),
					iim_core_f( $p, 'default_whatsapp_message', __( 'Default WhatsApp message', 'iim-core' ), 'text' ),
					iim_core_f( $p, 'footer_description', __( 'Footer description', 'iim-core' ), 'textarea', array( 'rows' => 2, 'maxlength' => 200 ) ),
					iim_core_f( $p, 'show_prices', __( 'Show prices on the site', 'iim-core' ), 'true_false', array( 'ui' => 1, 'instructions' => __( 'Master switch. Each service also has its own switch.', 'iim-core' ) ) ),
					iim_core_f( $p, 'price_note', __( 'Note under price lists', 'iim-core' ), 'text' ),

					iim_core_tab( $p, __( 'Areas and hubs', 'iim-core' ) ),
					iim_core_f( $p, 'service_areas', __( 'Areas served (one per line)', 'iim-core' ), 'textarea', array( 'instructions' => __( 'Used for areaServed in schema. Example: Deira', 'iim-core' ) ) ),
					iim_core_f( $p, 'services_hub_title', __( 'Services hub: H1', 'iim-core' ) ),
					iim_core_f( $p, 'services_hub_lead', __( 'Services hub: intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'areas_hub_title', __( 'Areas hub: H1', 'iim-core' ) ),
					iim_core_f( $p, 'areas_hub_lead', __( 'Areas hub: intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'projects_hub_title', __( 'Projects hub: H1', 'iim-core' ) ),
					iim_core_f( $p, 'projects_hub_lead', __( 'Projects hub: intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'guides_hub_title', __( 'Guides hub: H1', 'iim-core' ) ),
					iim_core_f( $p, 'guides_hub_lead', __( 'Guides hub: intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),

					iim_core_tab( $p, __( 'Privacy', 'iim-core' ) ),
					iim_core_f( $p, 'data_retention_months', __( 'Delete leads after (months)', 'iim-core' ), 'number', array( 'min' => 1, 'max' => 120, 'instructions' => __( 'Must match the privacy policy.', 'iim-core' ) ) ),
				),
			)
		);

		/*
		 * 2. Page intro: hero, direct answer, review date, WhatsApp message.
		 */
		$p          = 'intro';
		$intro_locs = array();
		foreach ( array( 'service', 'area', 'guide', 'project', 'page' ) as $type ) {
			$intro_locs[] = array( array( 'param' => 'post_type', 'operator' => '==', 'value' => $type ) );
		}
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_intro',
				'title'      => __( 'Page intro', 'iim-core' ),
				'location'   => $intro_locs,
				'menu_order' => 0,
				'position'   => 'acf_after_title',
				'fields'     => array(
					iim_core_f( $p, 'hero_headline', __( 'H1 headline', 'iim-core' ), 'text', array( 'instructions' => __( 'The one H1 on the page. Include the service and "Dubai" where natural.', 'iim-core' ), 'maxlength' => 90 ) ),
					iim_core_f( $p, 'hero_subhead', __( 'Subheading', 'iim-core' ), 'textarea', array( 'rows' => 2, 'maxlength' => 220 ) ),
					iim_core_f( $p, 'direct_answer', __( 'Direct answer (40 to 60 words)', 'iim-core' ), 'textarea', array( 'rows' => 3, 'instructions' => __( 'Answer the main question of this page in plain words, first. This is what answer engines quote.', 'iim-core' ), 'wrapper' => array( 'class' => 'iim-direct-answer' ) ) ),
					iim_core_f( $p, 'last_reviewed', __( 'Last reviewed', 'iim-core' ), 'date_picker', array( 'return_format' => 'Y-m-d', 'display_format' => 'd M Y' ) ),
					iim_core_f( $p, 'whatsapp_message', __( 'WhatsApp message for this page', 'iim-core' ), 'text', array( 'instructions' => __( 'Optional. Leave empty for the automatic message.', 'iim-core' ) ) ),
				),
			)
		);

		/*
		 * 3. Body sections (flexible content: fixed layouts).
		 */
		$p        = 'body';
		$sec_locs = array(
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'service' ) ),
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'area' ) ),
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'project' ) ),
			array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-amc.php' ) ),
			array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-amc-plan.php' ) ),
			array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-about.php' ) ),
		);
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_body',
				'title'      => __( 'Body sections', 'iim-core' ),
				'location'   => $sec_locs,
				'menu_order' => 10,
				'fields'     => array(
					iim_core_f(
						$p,
						'sections',
						__( 'Sections', 'iim-core' ),
						'flexible_content',
						array(
							'button_label' => __( 'Add section', 'iim-core' ),
							'layouts'      => array(
								'layout_iim_text'       => array(
									'key'        => 'layout_iim_text',
									'name'       => 'text',
									'label'      => __( 'Heading and text', 'iim-core' ),
									'display'    => 'block',
									'sub_fields' => array(
										iim_core_f( 'sec_text', 'heading', __( 'Heading (H2)', 'iim-core' ) ),
										iim_core_f( 'sec_text', 'body', __( 'Text', 'iim-core' ), 'wysiwyg', array( 'toolbar' => 'basic', 'media_upload' => 0 ) ),
									),
								),
								'layout_iim_checklist'  => array(
									'key'        => 'layout_iim_checklist',
									'name'       => 'checklist',
									'label'      => __( 'Checklist', 'iim-core' ),
									'display'    => 'block',
									'sub_fields' => array(
										iim_core_f( 'sec_check', 'heading', __( 'Heading (H2)', 'iim-core' ) ),
										iim_core_f( 'sec_check', 'intro', __( 'Intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
										iim_core_f( 'sec_check', 'items', __( 'Items', 'iim-core' ), 'repeater', array( 'layout' => 'table', 'sub_fields' => array( iim_core_f( 'sec_check_i', 'text', __( 'Item', 'iim-core' ) ) ) ) ),
									),
								),
								'layout_iim_steps'      => array(
									'key'        => 'layout_iim_steps',
									'name'       => 'steps',
									'label'      => __( 'Numbered steps', 'iim-core' ),
									'display'    => 'block',
									'sub_fields' => array(
										iim_core_f( 'sec_steps', 'heading', __( 'Heading (H2)', 'iim-core' ) ),
										iim_core_f(
											'sec_steps',
											'items',
											__( 'Steps', 'iim-core' ),
											'repeater',
											array(
												'max'        => 6,
												'layout'     => 'table',
												'sub_fields' => array(
													iim_core_f( 'sec_steps_i', 'title', __( 'Title', 'iim-core' ) ),
													iim_core_f( 'sec_steps_i', 'text', __( 'Text', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
												),
											)
										),
									),
								),
								'layout_iim_media_text' => array(
									'key'        => 'layout_iim_media_text',
									'name'       => 'media_text',
									'label'      => __( 'Image and text', 'iim-core' ),
									'display'    => 'block',
									'sub_fields' => array(
										iim_core_f( 'sec_mt', 'heading', __( 'Heading (H2)', 'iim-core' ) ),
										iim_core_f( 'sec_mt', 'image', __( 'Image (real photo, 16:10)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-card-sm' ) ),
										iim_core_f( 'sec_mt', 'image_position', __( 'Image side', 'iim-core' ), 'button_group', array( 'choices' => array( 'left' => __( 'Left', 'iim-core' ), 'right' => __( 'Right', 'iim-core' ) ) ) ),
										iim_core_f( 'sec_mt', 'body', __( 'Text', 'iim-core' ), 'wysiwyg', array( 'toolbar' => 'basic', 'media_upload' => 0 ) ),
									),
								),
								'layout_iim_callout'    => array(
									'key'        => 'layout_iim_callout',
									'name'       => 'callout',
									'label'      => __( 'Highlighted note', 'iim-core' ),
									'display'    => 'block',
									'sub_fields' => array(
										iim_core_f( 'sec_call', 'heading', __( 'Heading (H2, optional)', 'iim-core' ) ),
										iim_core_f( 'sec_call', 'text', __( 'Text', 'iim-core' ), 'textarea', array( 'rows' => 3 ) ),
									),
								),
							),
						)
					),
				),
			)
		);

		/*
		 * 4. FAQ repeater and CTA settings.
		 */
		$p        = 'faqcta';
		$faq_locs = array(
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'service' ) ),
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'area' ) ),
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'guide' ) ),
			array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-amc.php' ) ),
			array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-amc-plan.php' ) ),
		);
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_faq_cta',
				'title'      => __( 'Questions and call to action', 'iim-core' ),
				'location'   => $faq_locs,
				'menu_order' => 20,
				'fields'     => array(
					iim_core_f(
						$p,
						'faqs',
						__( 'FAQ', 'iim-core' ),
						'repeater',
						array(
							'instructions' => __( 'Write questions the way customers ask them. Shown on the page and as FAQPage schema.', 'iim-core' ),
							'layout'       => 'block',
							'button_label' => __( 'Add question', 'iim-core' ),
							'sub_fields'   => array(
								iim_core_f( 'faq_row', 'question', __( 'Question', 'iim-core' ) ),
								iim_core_f( 'faq_row', 'answer', __( 'Answer', 'iim-core' ), 'textarea', array( 'rows' => 3 ) ),
							),
						)
					),
					iim_core_f( $p, 'cta_heading', __( 'Final call to action: heading', 'iim-core' ) ),
					iim_core_f( $p, 'cta_text', __( 'Final call to action: text', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
				),
			)
		);

		/*
		 * 5. Service details.
		 */
		$p = 'svc';
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_service',
				'title'      => __( 'Service details', 'iim-core' ),
				'location'   => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'service' ) ) ),
				'menu_order' => 5,
				'position'   => 'side',
				'fields'     => array(
					iim_core_f( $p, 'icon', __( 'Icon', 'iim-core' ), 'select', array( 'choices' => iim_core_icon_choices(), 'default_value' => 'wrench' ) ),
					iim_core_f( $p, 'card_image', __( 'Card image (16:10)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-card-sm' ) ),
					iim_core_f( $p, 'card_summary', __( 'Card summary', 'iim-core' ), 'textarea', array( 'rows' => 3, 'maxlength' => 140 ) ),
					iim_core_f( $p, 'menu_summary', __( 'Menu summary', 'iim-core' ), 'text', array( 'maxlength' => 60 ) ),
					iim_core_f( $p, 'whatsapp_noun', __( 'WhatsApp phrase', 'iim-core' ), 'text', array( 'instructions' => __( 'Completes "Hi IIM, I need … in Dubai." Example: an electrician', 'iim-core' ) ) ),
					iim_core_f( $p, 'schema_type', __( 'Schema service type', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: Electrical repair', 'iim-core' ) ) ),
					iim_core_f( $p, 'related_services', __( 'Related services', 'iim-core' ), 'relationship', array( 'post_type' => array( 'service' ), 'return_format' => 'id', 'max' => 3, 'filters' => array( 'search' ) ) ),
				),
			)
		);

		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_service_prices',
				'title'      => __( 'Starting prices (hidden until confirmed)', 'iim-core' ),
				'location'   => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'service' ) ) ),
				'menu_order' => 15,
				'fields'     => array(
					iim_core_f( $p, 'show_prices', __( 'Show prices on this service', 'iim-core' ), 'true_false', array( 'ui' => 1, 'instructions' => __( 'Prices also need the master switch in Business Info.', 'iim-core' ) ) ),
					iim_core_f(
						$p,
						'prices',
						__( 'Prices', 'iim-core' ),
						'repeater',
						array(
							'layout'     => 'table',
							'sub_fields' => array(
								iim_core_f( 'svc_price', 'name', __( 'Item', 'iim-core' ) ),
								iim_core_f( 'svc_price', 'price_from', __( 'From (AED)', 'iim-core' ), 'number', array( 'min' => 0 ) ),
								iim_core_f( 'svc_price', 'note', __( 'Note', 'iim-core' ) ),
							),
						)
					),
				),
			)
		);

		/*
		 * 6. Area details.
		 */
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_area',
				'title'      => __( 'Area details', 'iim-core' ),
				'location'   => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'area' ) ) ),
				'position'   => 'side',
				'fields'     => array(
					iim_core_f( 'area', 'card_summary', __( 'Card summary', 'iim-core' ), 'textarea', array( 'rows' => 3, 'maxlength' => 140 ) ),
					iim_core_f( 'area', 'services_offered', __( 'Services offered here', 'iim-core' ), 'relationship', array( 'post_type' => array( 'service' ), 'return_format' => 'id' ) ),
				),
			)
		);

		/*
		 * 7. Project details.
		 */
		$p = 'proj';
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_project',
				'title'    => __( 'Project details', 'iim-core' ),
				'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'project' ) ) ),
				'fields'   => array(
					iim_core_f( $p, 'before_image', __( 'Before photo (square crop)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-square' ) ),
					iim_core_f( $p, 'after_image', __( 'After photo (square crop)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-square' ) ),
					iim_core_f( $p, 'gallery', __( 'More photos', 'iim-core' ), 'gallery', array( 'return_format' => 'id', 'max' => 8 ) ),
					iim_core_f( $p, 'service', __( 'Service', 'iim-core' ), 'relationship', array( 'post_type' => array( 'service' ), 'return_format' => 'id', 'max' => 2 ) ),
					iim_core_f( $p, 'area', __( 'Area', 'iim-core' ), 'relationship', array( 'post_type' => array( 'area' ), 'return_format' => 'id', 'max' => 1 ) ),
					iim_core_f( $p, 'location_text', __( 'Location (as shown)', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: Villa, Al Barsha. No customer names or unit numbers.', 'iim-core' ) ) ),
					iim_core_f( $p, 'completed', __( 'Completed', 'iim-core' ), 'date_picker', array( 'return_format' => 'Y-m-d' ) ),
				),
			)
		);

		/*
		 * 8. Testimonial.
		 */
		$p = 'testi';
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_testimonial',
				'title'    => __( 'Testimonial details', 'iim-core' ),
				'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'testimonial' ) ) ),
				'fields'   => array(
					iim_core_f( $p, 'help', __( 'How to add', 'iim-core' ), 'message', array( 'message' => __( 'Title = customer name as they agreed to be shown. Text = their words, unedited apart from spelling.', 'iim-core' ) ) ),
					iim_core_f( $p, 'permission_confirmed', __( 'Customer agreed to publication', 'iim-core' ), 'true_false', array( 'ui' => 1, 'instructions' => __( 'Testimonials are hidden until this is on.', 'iim-core' ) ) ),
					iim_core_f( $p, 'rating', __( 'Star rating', 'iim-core' ), 'number', array( 'min' => 1, 'max' => 5 ) ),
					iim_core_f( $p, 'context', __( 'Context', 'iim-core' ), 'text', array( 'instructions' => __( 'Example: Annual maintenance contract, villa in Mirdif', 'iim-core' ) ) ),
					iim_core_f( $p, 'source', __( 'Source', 'iim-core' ), 'select', array( 'choices' => array( 'google' => 'Google', 'direct' => __( 'Direct (email/WhatsApp)', 'iim-core' ), 'other' => __( 'Other', 'iim-core' ) ) ) ),
					iim_core_f( $p, 'source_url', __( 'Link to the original review', 'iim-core' ), 'url' ),
				),
			)
		);

		/*
		 * 9. FAQ post.
		 */
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_faq',
				'title'    => __( 'FAQ settings', 'iim-core' ),
				'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'faq' ) ) ),
				'position' => 'side',
				'fields'   => array(
					iim_core_f( 'faqp', 'show_on_home', __( 'Show on the homepage', 'iim-core' ), 'true_false', array( 'ui' => 1, 'instructions' => __( 'Six to eight questions.', 'iim-core' ) ) ),
				),
			)
		);

		/*
		 * 10. Guide (E-E-A-T).
		 */
		$p = 'guide';
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_guide',
				'title'    => __( 'Author and review', 'iim-core' ),
				'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'guide' ) ) ),
				'position' => 'side',
				'fields'   => array(
					iim_core_f( $p, 'author_name', __( 'Written by', 'iim-core' ) ),
					iim_core_f( $p, 'reviewer_name', __( 'Reviewed by', 'iim-core' ), 'text', array( 'instructions' => __( 'A named, qualified technician.', 'iim-core' ) ) ),
					iim_core_f( $p, 'reviewer_credentials', __( 'Reviewer credentials', 'iim-core' ) ),
					iim_core_f( $p, 'related_services', __( 'Related services', 'iim-core' ), 'relationship', array( 'post_type' => array( 'service' ), 'return_format' => 'id', 'max' => 3 ) ),
				),
			)
		);

		/*
		 * 11. Homepage.
		 */
		$p = 'home';
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_home',
				'title'      => __( 'Homepage', 'iim-core' ),
				'location'   => array( array( array( 'param' => 'page_type', 'operator' => '==', 'value' => 'front_page' ) ) ),
				'menu_order' => 5,
				'fields'     => array(
					iim_core_f( $p, 'hero_accent', __( 'Hero accent line (amber)', 'iim-core' ), 'text', array( 'maxlength' => 40 ) ),
					iim_core_f( $p, 'hero_image', __( 'Hero photo (4:3, real team or job photo)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-card-sm', 'instructions' => __( 'Optional. Without it, the hero is text only (fastest).', 'iim-core' ) ) ),
					iim_core_f( $p, 'services_heading', __( 'Services heading', 'iim-core' ) ),
					iim_core_f( $p, 'services_intro', __( 'Services intro', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
					iim_core_f( $p, 'why_heading', __( 'Why IIM heading', 'iim-core' ) ),
					iim_core_f(
						$p,
						'why_items',
						__( 'Why IIM proof points', 'iim-core' ),
						'repeater',
						array(
							'min'        => 0,
							'max'        => 4,
							'layout'     => 'table',
							'sub_fields' => array(
								iim_core_f( 'home_why', 'icon', __( 'Icon', 'iim-core' ), 'select', array( 'choices' => iim_core_icon_choices() ) ),
								iim_core_f( 'home_why', 'title', __( 'Title', 'iim-core' ) ),
								iim_core_f( 'home_why', 'text', __( 'Text', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
							),
						)
					),
					iim_core_f( $p, 'amc_heading', __( 'Annual contract heading', 'iim-core' ) ),
					iim_core_f( $p, 'amc_text', __( 'Annual contract text', 'iim-core' ), 'textarea', array( 'rows' => 2 ) ),
				),
			)
		);

		/*
		 * 12. About: team (real people only).
		 */
		acf_add_local_field_group(
			array(
				'key'        => 'group_iim_about',
				'title'      => __( 'Team', 'iim-core' ),
				'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-about.php' ) ) ),
				'menu_order' => 30,
				'fields'     => array(
					iim_core_f(
						'about',
						'team',
						__( 'Technicians', 'iim-core' ),
						'repeater',
						array(
							'instructions' => __( 'Real people with their consent. Hidden while empty.', 'iim-core' ),
							'layout'       => 'block',
							'sub_fields'   => array(
								iim_core_f( 'about_team', 'name', __( 'Name', 'iim-core' ) ),
								iim_core_f( 'about_team', 'role', __( 'Role', 'iim-core' ) ),
								iim_core_f( 'about_team', 'credentials', __( 'Licence or certification', 'iim-core' ) ),
								iim_core_f( 'about_team', 'photo', __( 'Photo (16:10)', 'iim-core' ), 'image', array( 'return_format' => 'id', 'preview_size' => 'iim-card-sm' ) ),
							),
						)
					),
				),
			)
		);

		/*
		 * 13. Annual contract plan card summary.
		 */
		acf_add_local_field_group(
			array(
				'key'      => 'group_iim_amc_plan',
				'title'    => __( 'Plan card', 'iim-core' ),
				'location' => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'templates/page-amc-plan.php' ) ) ),
				'position' => 'side',
				'fields'   => array(
					iim_core_f( 'amcp', 'card_summary', __( 'Summary on the hub page', 'iim-core' ), 'textarea', array( 'rows' => 3, 'maxlength' => 160 ) ),
				),
			)
		);
	}
);
