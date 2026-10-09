<?php
/**
 * Renders the flexible-content "Body sections" field. Each layout is a fixed design, so editors
 * change words and images without being able to break widths, spacing or corners.
 *
 * Args: post_id (int).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_sections = iim_sections( (int) ( $args['post_id'] ?? get_the_ID() ) );

foreach ( $iim_sections as $iim_index => $iim_s ) :
	$iim_layout  = $iim_s['acf_fc_layout'] ?? '';
	$iim_heading = $iim_s['heading'] ?? '';
	$iim_hid     = 'sec-' . $iim_index;
	?>
	<section class="content-block" aria-labelledby="<?php echo esc_attr( $iim_hid ); ?>" data-reveal>
		<?php if ( $iim_heading ) : ?>
			<h2 id="<?php echo esc_attr( $iim_hid ); ?>"><?php echo esc_html( $iim_heading ); ?></h2>
		<?php endif; ?>

		<?php
		switch ( $iim_layout ) {
			case 'text':
				echo '<div class="prose">' . wp_kses_post( $iim_s['body'] ?? '' ) . '</div>';
				break;

			case 'checklist':
				if ( ! empty( $iim_s['intro'] ) ) {
					echo '<p>' . esc_html( $iim_s['intro'] ) . '</p>';
				}
				$iim_items = array_filter( (array) ( $iim_s['items'] ?? array() ), fn( $r ) => ! empty( $r['text'] ) );
				if ( $iim_items ) {
					echo '<ul class="checklist checklist--2">';
					foreach ( $iim_items as $iim_item ) {
						echo '<li>' . iim_icon( 'circle-check' ) . '<span>' . esc_html( $iim_item['text'] ) . '</span></li>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}
					echo '</ul>';
				}
				break;

			case 'steps':
				$iim_items = array_filter( (array) ( $iim_s['items'] ?? array() ), fn( $r ) => ! empty( $r['title'] ) );
				if ( $iim_items ) {
					echo '<ol class="steps">';
					foreach ( $iim_items as $iim_item ) {
						echo '<li class="step"><h3>' . esc_html( $iim_item['title'] ) . '</h3><p>' . esc_html( $iim_item['text'] ?? '' ) . '</p></li>';
					}
					echo '</ol>';
				}
				break;

			case 'media_text':
				$iim_right = 'right' === ( $iim_s['image_position'] ?? 'left' );
				echo '<div class="media-text' . ( $iim_right ? ' media-text--right' : '' ) . '">';
				echo '<div class="media-text__img">' . iim_img( $iim_s['image'] ?? 0, 'iim-card', '(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw', array(), $iim_heading ) . '</div>'; // phpcs:ignore
				echo '<div class="prose">' . wp_kses_post( $iim_s['body'] ?? '' ) . '</div>';
				echo '</div>';
				break;

			case 'callout':
				echo '<div class="answer-box"><p>' . esc_html( $iim_s['text'] ?? '' ) . '</p></div>';
				break;
		}
		?>
	</section>
	<?php
endforeach;
