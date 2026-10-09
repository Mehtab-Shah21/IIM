<?php
/**
 * WP-CLI commands.
 *
 *   wp iim seed [--update]      Create pages, services, FAQs, testimonials and SEO meta from seed/content.json.
 *   wp iim retry-webhooks       Retry every pending or failed lead delivery now.
 *   wp iim test-webhook         Send a signed test payload to IIM_WEBHOOK_URL.
 *   wp iim check                Report missing Business Info, placeholders and unconfirmed claims.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * IIM site commands.
 */
class IIM_Core_CLI {

	/**
	 * Seed content. Existing items (matched by slug) are skipped unless --update is given.
	 *
	 * ## OPTIONS
	 *
	 * [--update]
	 * : Overwrite fields of existing items.
	 *
	 * @param array $args       Positional.
	 * @param array $assoc_args Flags.
	 */
	public function seed( $args, $assoc_args ) {
		if ( ! function_exists( 'update_field' ) ) {
			WP_CLI::error( 'ACF Pro must be active before seeding.' );
		}
		$update = ! empty( $assoc_args['update'] );
		$data   = json_decode( (string) file_get_contents( IIM_CORE_DIR . 'seed/content.json' ), true ); // phpcs:ignore
		if ( ! is_array( $data ) ) {
			WP_CLI::error( 'seed/content.json could not be read.' );
		}

		update_option( 'permalink_structure', '/%postname%/' );

		// Services.
		$service_ids = array();
		foreach ( $data['services'] as $s ) {
			$id = $this->upsert( 'service', $s['slug'], $s['title'], array( 'menu_order' => $s['order'] ), $update, $created );
			$service_ids[ $s['slug'] ] = $id;
			if ( ! $created && ! $update ) {
				continue;
			}
			$this->fields(
				$id,
				array(
					'field_iim_intro_hero_headline' => $s['hero_headline'],
					'field_iim_intro_hero_subhead'  => $s['hero_subhead'],
					'field_iim_intro_direct_answer' => $s['direct_answer'],
					'field_iim_intro_last_reviewed' => wp_date( 'Ymd' ),
					'field_iim_svc_icon'            => $s['icon'],
					'field_iim_svc_menu_summary'    => $s['menu_summary'],
					'field_iim_svc_card_summary'    => $s['card_summary'],
					'field_iim_svc_whatsapp_noun'   => $s['whatsapp_noun'],
					'field_iim_svc_schema_type'     => $s['schema_type'],
					'field_iim_body_sections'       => $this->sections( $s['sections'] ),
					'field_iim_faqcta_faqs'         => $s['faqs'],
					'field_iim_svc_show_prices'     => 0,
					'field_iim_svc_prices'          => $s['prices'],
				)
			);
			$this->seo( $id, $s['seo_title'], $s['seo_description'] );
			WP_CLI::log( "Service: {$s['title']}" );
		}

		// Related services: the next two in order.
		$ids = array_values( $service_ids );
		foreach ( $ids as $i => $id ) {
			if ( $update || ! get_field( 'related_services', $id ) ) {
				update_field( 'field_iim_svc_related_services', array( $ids[ ( $i + 1 ) % count( $ids ) ], $ids[ ( $i + 2 ) % count( $ids ) ] ), $id );
			}
		}

		// Pages (parents first, as listed).
		foreach ( $data['pages'] as $p ) {
			$parent = ! empty( $p['parent'] ) ? (int) ( get_page_by_path( $p['parent'] )->ID ?? 0 ) : 0;
			$extra  = array(
				'post_parent'  => $parent,
				'post_status'  => $p['status'] ?? 'publish',
				'post_content' => $p['content'] ?? '',
			);
			$id = $this->upsert( 'page', $p['slug'], $p['title'], $extra, $update, $created );
			if ( ! $created && ! $update ) {
				continue;
			}
			if ( ! empty( $p['template'] ) ) {
				update_post_meta( $id, '_wp_page_template', $p['template'] );
			}
			if ( ! empty( $p['front_page'] ) ) {
				update_option( 'show_on_front', 'page' );
				update_option( 'page_on_front', $id );
			}
			$map = array(
				'hero_headline' => 'field_iim_intro_hero_headline',
				'hero_subhead'  => 'field_iim_intro_hero_subhead',
				'direct_answer' => 'field_iim_intro_direct_answer',
				'hero_accent'   => 'field_iim_home_hero_accent',
				'card_summary'  => 'field_iim_amcp_card_summary',
			);
			$values = array();
			foreach ( (array) $p['fields'] as $k => $v ) {
				if ( isset( $map[ $k ] ) ) {
					$values[ $map[ $k ] ] = $v;
				}
			}
			if ( ! empty( $p['sections'] ) ) {
				$values['field_iim_body_sections'] = $this->sections( $p['sections'] );
			}
			if ( ! empty( $p['faqs'] ) ) {
				$values['field_iim_faqcta_faqs'] = $p['faqs'];
			}
			$this->fields( $id, $values );
			$this->seo( $id, $p['seo_title'], $p['seo_description'] );
			WP_CLI::log( "Page: {$p['title']} (" . ( $p['status'] ?? 'publish' ) . ')' );
		}

		// FAQ topics and FAQs.
		foreach ( $data['faq_topics'] as $topic ) {
			if ( ! term_exists( $topic['slug'], 'faq_topic' ) ) {
				wp_insert_term( $topic['name'], 'faq_topic', array( 'slug' => $topic['slug'] ) );
			}
		}
		foreach ( $data['faqs'] as $i => $f ) {
			$slug = sanitize_title( $f['q'] );
			$id   = $this->upsert(
				'faq',
				$slug,
				$f['q'],
				array(
					'post_content' => '<p>' . esc_html( $f['a'] ) . '</p>',
					'menu_order'   => $i,
					'post_status'  => $f['status'] ?? 'publish',
				),
				$update,
				$created
			);
			if ( $created || $update ) {
				wp_set_object_terms( $id, $f['topic'], 'faq_topic' );
				update_field( 'field_iim_faqp_show_on_home', ! empty( $f['home'] ) ? 1 : 0, $id );
			}
		}
		WP_CLI::log( 'FAQs: ' . count( $data['faqs'] ) );

		// Testimonials: hidden until permission is confirmed.
		foreach ( $data['testimonials'] as $i => $t ) {
			$id = $this->upsert( 'testimonial', sanitize_title( $t['name'] ), $t['name'], array( 'post_content' => $t['text'], 'menu_order' => $i ), $update, $created );
			if ( $created ) {
				update_field( 'field_iim_testi_context', $t['context'], $id );
				update_field( 'field_iim_testi_permission_confirmed', 0, $id );
				update_field( 'field_iim_testi_source', 'direct', $id );
			}
		}
		WP_CLI::log( 'Testimonials: ' . count( $data['testimonials'] ) . ' (hidden until permission is ticked)' );

		flush_rewrite_rules();
		WP_CLI::success( 'Seed complete. Next: fill in Business Info, then run `wp iim check`.' );
	}

	/**
	 * Retry all pending or failed lead deliveries now.
	 */
	public function retry_webhooks() {
		$ids = get_posts(
			array(
				'post_type'      => 'lead',
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => -1,
				'meta_query'     => array( array( 'key' => '_iim_webhook_status', 'value' => array( 'pending', 'failed' ), 'compare' => 'IN' ) ), // phpcs:ignore
			)
		);
		foreach ( $ids as $id ) {
			update_post_meta( $id, '_iim_webhook_attempts', 0 );
			WP_CLI::log( get_post_meta( $id, '_iim_ref', true ) . ': ' . ( iim_core_deliver_webhook( $id ) ? 'sent' : 'failed' ) );
		}
		WP_CLI::success( count( $ids ) . ' lead(s) processed.' );
	}

	/**
	 * Send a signed test payload to the webhook.
	 */
	public function test_webhook() {
		if ( ! defined( 'IIM_WEBHOOK_URL' ) || ! IIM_WEBHOOK_URL ) {
			WP_CLI::error( 'IIM_WEBHOOK_URL is not defined in wp-config.php.' );
		}
		$body = wp_json_encode( array( 'event' => 'test', 'sent_at' => gmdate( 'c' ) ) );
		$ts   = time();
		$sig  = hash_hmac( 'sha256', $ts . '.' . $body, defined( 'IIM_WEBHOOK_SECRET' ) ? IIM_WEBHOOK_SECRET : '' );
		$res  = wp_remote_post( IIM_WEBHOOK_URL, array( 'timeout' => 10, 'headers' => array( 'Content-Type' => 'application/json', 'X-IIM-Signature' => "t={$ts},v1={$sig}" ), 'body' => $body ) );
		if ( is_wp_error( $res ) ) {
			WP_CLI::error( $res->get_error_message() );
		}
		WP_CLI::success( 'HTTP ' . wp_remote_retrieve_response_code( $res ) );
	}

	/**
	 * Pre-launch check: Business Info gaps, unconfirmed claims, placeholder text left in content.
	 */
	public function check() {
		$warn = 0;
		foreach ( array( 'business_name', 'phone_e164', 'whatsapp_e164', 'email', 'owner_email', 'address_street', 'hours_text', 'license_number', 'gbp_url', 'review_url' ) as $k ) {
			if ( ! get_field( $k, 'option' ) ) {
				WP_CLI::warning( "Business Info: '{$k}' is empty." );
				++$warn;
			}
		}
		foreach ( array( 'dewa_show', 'claim_247', 'free_quote', 'rating_show', 'show_prices' ) as $k ) {
			WP_CLI::log( sprintf( 'Claim %-12s %s', $k, get_field( $k, 'option' ) ? 'ON  (confirmed in writing?)' : 'off' ) );
		}
		foreach ( array( 'IIM_WEBHOOK_URL', 'IIM_WEBHOOK_SECRET', 'IIM_TURNSTILE_SITE_KEY', 'IIM_TURNSTILE_SECRET_KEY', 'IIM_LOGIN_SLUG' ) as $c ) {
			if ( ! defined( $c ) || ! constant( $c ) ) {
				WP_CLI::warning( "wp-config.php: {$c} is not set." );
				++$warn;
			}
		}
		global $wpdb;
		$hits = $wpdb->get_col( "SELECT DISTINCT p.ID FROM {$wpdb->posts} p LEFT JOIN {$wpdb->postmeta} m ON m.post_id = p.ID WHERE p.post_status = 'publish' AND ( p.post_content LIKE '%[CONFIRM%' OR m.meta_value LIKE '%[CONFIRM%' )" ); // phpcs:ignore
		foreach ( $hits as $id ) {
			WP_CLI::warning( 'Published content contains [CONFIRM]: ' . get_the_title( $id ) . ' (' . get_permalink( $id ) . ')' );
			++$warn;
		}
		if ( 'production' === wp_get_environment_type() && get_option( 'blog_public' ) === '0' ) {
			WP_CLI::warning( 'Production has "Discourage search engines" switched on.' );
			++$warn;
		}
		$warn ? WP_CLI::warning( "{$warn} issue(s) to resolve before launch." ) : WP_CLI::success( 'No issues found.' );
	}

	/**
	 * Create or find a post by slug.
	 *
	 * @param string    $type    Post type.
	 * @param string    $slug    Slug.
	 * @param string    $title   Title.
	 * @param array     $extra   Extra post fields.
	 * @param bool      $update  Update existing.
	 * @param bool|null $created Set to whether it was created.
	 */
	private function upsert( $type, $slug, $title, $extra, $update, &$created ) {
		$existing = get_posts(
			array(
				'post_type'      => $type,
				'name'           => $slug,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'post_parent'    => $extra['post_parent'] ?? '',
			)
		);
		$created = ! $existing;
		$post    = array_merge(
			array(
				'post_type'   => $type,
				'post_name'   => $slug,
				'post_title'  => $title,
				'post_status' => 'publish',
			),
			$extra
		);
		if ( $existing ) {
			if ( $update ) {
				$post['ID'] = $existing[0]->ID;
				wp_update_post( $post );
			}
			return $existing[0]->ID;
		}
		$id = wp_insert_post( $post, true );
		if ( is_wp_error( $id ) ) {
			WP_CLI::error( "{$type} {$slug}: " . $id->get_error_message() );
		}
		return $id;
	}

	/**
	 * Update ACF fields by key.
	 *
	 * @param int   $id     Post.
	 * @param array $values key => value.
	 */
	private function fields( $id, $values ) {
		foreach ( $values as $key => $value ) {
			update_field( $key, $value, $id );
		}
	}

	/**
	 * Convert seed sections (checklist items as strings) to ACF rows.
	 *
	 * @param array $sections Sections.
	 */
	private function sections( $sections ) {
		return array_map(
			function ( $s ) {
				if ( 'checklist' === $s['acf_fc_layout'] ) {
					$s['items'] = array_map( fn( $t ) => array( 'text' => $t ), $s['items'] );
				}
				return $s;
			},
			$sections
		);
	}

	/**
	 * Rank Math title and description.
	 *
	 * @param int    $id    Post.
	 * @param string $title Title.
	 * @param string $desc  Description.
	 */
	private function seo( $id, $title, $desc ) {
		if ( $title ) {
			update_post_meta( $id, 'rank_math_title', $title );
		}
		if ( $desc ) {
			update_post_meta( $id, 'rank_math_description', $desc );
		}
	}
}

WP_CLI::add_command( 'iim', 'IIM_Core_CLI' );
