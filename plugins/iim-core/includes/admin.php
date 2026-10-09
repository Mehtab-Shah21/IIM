<?php
/**
 * Admin UI: lead list columns and filters, lead detail box with photos and retry, and a live
 * word counter for the 40–60 word direct answer.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

// ---------- Lead list ----------
add_filter(
	'manage_lead_posts_columns',
	function () {
		return array(
			'cb'           => '<input type="checkbox">',
			'title'        => __( 'Lead', 'iim-core' ),
			'iim_phone'    => __( 'Phone', 'iim-core' ),
			'iim_location' => __( 'Location', 'iim-core' ),
			'iim_when'     => __( 'Preferred', 'iim-core' ),
			'iim_delivery' => __( 'Sheet / WhatsApp alert', 'iim-core' ),
			'date'         => __( 'Received', 'iim-core' ),
		);
	}
);

add_action(
	'manage_lead_posts_custom_column',
	function ( $column, $post_id ) {
		$data = (array) get_post_meta( $post_id, '_iim_data', true );
		switch ( $column ) {
			case 'iim_phone':
				$phone = $data['phone'] ?? '';
				if ( $phone ) {
					printf( '<a href="%1$s">%2$s</a> · <a href="%3$s" target="_blank" rel="noopener">WhatsApp</a>', esc_url( 'tel:' . $phone ), esc_html( $phone ), esc_url( 'https://wa.me/' . preg_replace( '/\D/', '', $phone ) ) );
				}
				break;
			case 'iim_location':
				echo esc_html( trim( ( $data['location'] ?? '' ) . ( ! empty( $data['emirate'] ) ? ', ' . $data['emirate'] : '' ) ) );
				break;
			case 'iim_when':
				echo esc_html( trim( ( $data['preferred_date'] ?? '' ) . ' ' . ( $data['preferred_time'] ?? '' ) ) );
				break;
			case 'iim_delivery':
				$status = (string) get_post_meta( $post_id, '_iim_webhook_status', true );
				printf( '<span class="iim-status iim-status--%1$s">%2$s</span>', esc_attr( $status ), esc_html( $status ) );
				if ( in_array( $status, array( 'failed', 'pending' ), true ) ) {
					printf( ' <a href="%s">%s</a>', esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=iim_retry_webhook&lead=' . (int) $post_id ), 'iim_retry_' . (int) $post_id ) ), esc_html__( 'Retry now', 'iim-core' ) );
				}
				break;
		}
	},
	10,
	2
);

// Filter by delivery status: edit.php?post_type=lead&iim_status=failed.
add_action(
	'pre_get_posts',
	function ( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() || 'lead' !== $query->get( 'post_type' ) ) {
			return;
		}
		$status = isset( $_GET['iim_status'] ) ? sanitize_key( $_GET['iim_status'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( $status ) {
			$query->set( 'meta_query', array( array( 'key' => '_iim_webhook_status', 'value' => $status ) ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
		}
	}
);

// ---------- Lead detail ----------
add_action(
	'add_meta_boxes_lead',
	function () {
		remove_meta_box( 'submitdiv', 'lead', 'side' );
		add_meta_box(
			'iim-lead',
			__( 'Request details', 'iim-core' ),
			function ( $post ) {
				$p = iim_core_lead_payload( $post->ID );
				echo '<table class="widefat striped"><tbody>';
				foreach ( array( 'reference', 'form', 'service_label', 'plan', 'name', 'phone', 'email', 'location', 'emirate', 'property_type', 'preferred_date', 'preferred_time', 'page_url' ) as $k ) {
					if ( '' === (string) $p[ $k ] ) {
						continue;
					}
					printf( '<tr><th style="width:180px">%s</th><td>%s</td></tr>', esc_html( ucwords( str_replace( '_', ' ', $k ) ) ), esc_html( $p[ $k ] ) );
				}
				if ( $p['issue'] ) {
					printf( '<tr><th>%s</th><td>%s</td></tr>', esc_html__( 'Details', 'iim-core' ), nl2br( esc_html( $p['issue'] ) ) );
				}
				if ( $p['photo_links'] ) {
					echo '<tr><th>' . esc_html__( 'Photos', 'iim-core' ) . '</th><td>';
					foreach ( $p['photo_links'] as $i => $url ) {
						printf( '<a href="%1$s" target="_blank" rel="noopener">%2$s %3$d</a> ', esc_url( $url ), esc_html__( 'Photo', 'iim-core' ), (int) $i + 1 );
					}
					echo '</td></tr>';
				}
				if ( $p['flags'] ) {
					printf( '<tr><th>%s</th><td>%s</td></tr>', esc_html__( 'Spam-check notes', 'iim-core' ), esc_html( implode( ', ', $p['flags'] ) ) );
				}
				$status = get_post_meta( $post->ID, '_iim_webhook_status', true );
				$error  = get_post_meta( $post->ID, '_iim_webhook_last_error', true );
				printf(
					'<tr><th>%s</th><td><span class="iim-status iim-status--%s">%s</span> %s · %s %s · %s %s</td></tr>',
					esc_html__( 'Delivery', 'iim-core' ),
					esc_attr( $status ),
					esc_html( $status ),
					esc_html( $error ),
					esc_html__( 'Owner email:', 'iim-core' ),
					esc_html( (string) get_post_meta( $post->ID, '_iim_owner_mail', true ) ),
					esc_html__( 'Customer email:', 'iim-core' ),
					esc_html( (string) get_post_meta( $post->ID, '_iim_customer_mail', true ) )
				);
				echo '</tbody></table>';
				printf(
					'<p><a class="button" href="%1$s" target="_blank" rel="noopener">%2$s</a> <a class="button" href="%3$s">%4$s</a></p>',
					esc_url( $p['whatsapp_link'] ),
					esc_html__( 'Reply on WhatsApp', 'iim-core' ),
					esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=iim_retry_webhook&lead=' . (int) $post->ID ), 'iim_retry_' . (int) $post->ID ) ),
					esc_html__( 'Resend to Sheet / WhatsApp alert', 'iim-core' )
				);
			},
			'lead',
			'normal',
			'high'
		);
	}
);

// Leads are read-only records.
add_filter(
	'post_row_actions',
	function ( $actions, $post ) {
		if ( 'lead' === $post->post_type ) {
			unset( $actions['inline hide-if-no-js'], $actions['view'] );
		}
		return $actions;
	},
	10,
	2
);

// ---------- Direct answer word counter ----------
add_action(
	'acf/input/admin_footer',
	function () {
		?>
		<script>
		(function () {
			document.querySelectorAll('.iim-direct-answer textarea').forEach(function (ta) {
				var out = document.createElement('p');
				out.className = 'iim-wordcount';
				ta.after(out);
				var update = function () {
					var n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
					out.textContent = n + ' <?php echo esc_js( __( 'words (aim for 40 to 60)', 'iim-core' ) ); ?>';
					out.classList.toggle('is-off', n > 0 && (n < 40 || n > 60));
				};
				ta.addEventListener('input', update);
				update();
			});
		})();
		</script>
		<?php
	}
);
