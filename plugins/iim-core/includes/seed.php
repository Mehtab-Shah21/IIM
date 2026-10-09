<?php
/**
 * Seeding from seed/content.json: pages, services, FAQs, testimonials and Rank Math meta.
 * Called by `wp iim seed` and by the Playground blueprint. Idempotent: existing items (matched by
 * slug) are left alone unless $update is true.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Run the seed.
 *
 * @param bool     $update Overwrite existing items.
 * @param callable $log    Logger, receives one line.
 * @return true|WP_Error
 */
function iim_core_seed( $update = false, $log = null ) {
	$log = $log ?: static function () {};
	if ( ! function_exists( 'update_field' ) ) {
		return new WP_Error( 'iim_seed_acf', 'ACF Pro (or Secure Custom Fields) must be active before seeding.' );
	}
	$data = json_decode( (string) file_get_contents( IIM_CORE_DIR . 'seed/content.json' ), true ); // phpcs:ignore
	if ( ! is_array( $data ) ) {
		return new WP_Error( 'iim_seed_json', 'seed/content.json could not be read.' );
	}

	update_option( 'permalink_structure', '/%postname%/' );
	update_option( 'blogname', 'IIM Technical Services' );
	update_option( 'blogdescription', __( 'Electrical, plumbing, AC and maintenance services in Dubai', 'iim-core' ) );
	update_option( 'timezone_string', 'Asia/Dubai' );

	// Services.
	$service_ids = array();
	foreach ( $data['services'] as $s ) {
		$created                   = false;
		$id                        = iim_core_seed_upsert( 'service', $s['slug'], $s['title'], array( 'menu_order' => $s['order'] ), $update, $created );
		$service_ids[ $s['slug'] ] = $id;
		if ( ! $created && ! $update ) {
			continue;
		}
		iim_core_seed_fields(
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
				'field_iim_body_sections'       => iim_core_seed_sections( $s['sections'] ),
				'field_iim_faqcta_faqs'         => $s['faqs'],
				'field_iim_svc_show_prices'     => 0,
				'field_iim_svc_prices'          => $s['prices'],
			)
		);
		iim_core_seed_seo( $id, $s['seo_title'], $s['seo_description'] );
		$log( "Service: {$s['title']}" );
	}

	// Related services: the next two in order.
	$ids = array_values( $service_ids );
	foreach ( $ids as $i => $id ) {
		if ( $update || ! get_field( 'related_services', $id ) ) {
			update_field( 'field_iim_svc_related_services', array( $ids[ ( $i + 1 ) % count( $ids ) ], $ids[ ( $i + 2 ) % count( $ids ) ] ), $id );
		}
	}

	// Pages (parents first, as listed).
	$map = array(
		'hero_headline' => 'field_iim_intro_hero_headline',
		'hero_subhead'  => 'field_iim_intro_hero_subhead',
		'direct_answer' => 'field_iim_intro_direct_answer',
		'hero_accent'   => 'field_iim_home_hero_accent',
		'card_summary'  => 'field_iim_amcp_card_summary',
	);
	foreach ( $data['pages'] as $p ) {
		$parent  = ! empty( $p['parent'] ) ? (int) ( get_page_by_path( $p['parent'] )->ID ?? 0 ) : 0;
		$created = false;
		$id      = iim_core_seed_upsert(
			'page',
			$p['slug'],
			$p['title'],
			array(
				'post_parent'  => $parent,
				'post_status'  => $p['status'] ?? 'publish',
				'post_content' => $p['content'] ?? '',
			),
			$update,
			$created
		);
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
		$values = array();
		foreach ( (array) $p['fields'] as $k => $v ) {
			if ( isset( $map[ $k ] ) ) {
				$values[ $map[ $k ] ] = $v;
			}
		}
		if ( ! empty( $p['sections'] ) ) {
			$values['field_iim_body_sections'] = iim_core_seed_sections( $p['sections'] );
		}
		if ( ! empty( $p['faqs'] ) ) {
			$values['field_iim_faqcta_faqs'] = $p['faqs'];
		}
		iim_core_seed_fields( $id, $values );
		iim_core_seed_seo( $id, $p['seo_title'], $p['seo_description'] );
		$log( "Page: {$p['title']} (" . ( $p['status'] ?? 'publish' ) . ')' );
	}

	// FAQ topics and FAQs.
	foreach ( $data['faq_topics'] as $topic ) {
		if ( ! term_exists( $topic['slug'], 'faq_topic' ) ) {
			wp_insert_term( $topic['name'], 'faq_topic', array( 'slug' => $topic['slug'] ) );
		}
	}
	foreach ( $data['faqs'] as $i => $f ) {
		$created = false;
		$id      = iim_core_seed_upsert(
			'faq',
			sanitize_title( $f['q'] ),
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
	$log( 'FAQs: ' . count( $data['faqs'] ) );

	// Testimonials: hidden until permission is confirmed.
	foreach ( $data['testimonials'] as $i => $t ) {
		$created = false;
		$id      = iim_core_seed_upsert( 'testimonial', sanitize_title( $t['name'] ), $t['name'], array( 'post_content' => $t['text'], 'menu_order' => $i ), $update, $created );
		if ( $created ) {
			update_field( 'field_iim_testi_context', $t['context'], $id );
			update_field( 'field_iim_testi_permission_confirmed', 0, $id );
			update_field( 'field_iim_testi_source', 'direct', $id );
		}
	}
	$log( 'Testimonials: ' . count( $data['testimonials'] ) . ' (hidden until permission is ticked)' );

	flush_rewrite_rules();
	return true;
}

/**
 * Create or find a post by slug (and parent, for pages).
 *
 * @param string $type    Post type.
 * @param string $slug    Slug.
 * @param string $title   Title.
 * @param array  $extra   Extra post fields.
 * @param bool   $update  Update existing.
 * @param bool   $created Set to whether it was created.
 * @return int
 */
function iim_core_seed_upsert( $type, $slug, $title, $extra, $update, &$created ) {
	$query = array(
		'post_type'        => $type,
		'name'             => $slug,
		'post_status'      => 'any',
		'posts_per_page'   => 1,
		'suppress_filters' => true,
	);
	if ( isset( $extra['post_parent'] ) ) {
		$query['post_parent'] = (int) $extra['post_parent'];
	}
	$existing = get_posts( $query );
	$created  = ! $existing;
	$post     = array_merge(
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
		return (int) $existing[0]->ID;
	}
	return (int) wp_insert_post( $post );
}

/**
 * Update ACF fields by key.
 *
 * @param int   $id     Post.
 * @param array $values key => value.
 */
function iim_core_seed_fields( $id, $values ) {
	foreach ( $values as $key => $value ) {
		update_field( $key, $value, $id );
	}
}

/**
 * Convert seed sections (checklist items as strings) to ACF rows.
 *
 * @param array $sections Sections.
 */
function iim_core_seed_sections( $sections ) {
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
function iim_core_seed_seo( $id, $title, $desc ) {
	if ( $title ) {
		update_post_meta( $id, 'rank_math_title', $title );
	}
	if ( $desc ) {
		update_post_meta( $id, 'rank_math_description', $desc );
	}
}
