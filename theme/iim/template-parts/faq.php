<?php
/**
 * FAQ list as native <details>: works without JS and keeps every answer in the HTML for crawlers.
 * The same items are passed to the FAQPage schema (see inc/schema-hooks.php).
 *
 * Args: items (array of question/answer), heading (string), center (bool), id (string).
 *
 * @package iim
 */

defined( 'ABSPATH' ) || exit;

$iim_items = $args['items'] ?? array();
if ( ! $iim_items ) {
	return;
}
$iim_center = ! empty( $args['center'] );
?>
<div class="faq<?php echo $iim_center ? ' faq--center' : ''; ?>">
	<?php foreach ( $iim_items as $iim_i => $iim_item ) : ?>
		<details class="faq__item"<?php echo 0 === $iim_i ? ' open' : ''; ?>>
			<summary>
				<span><?php echo esc_html( $iim_item['question'] ); ?></span>
				<?php echo iim_icon( 'chevron-down' ); // phpcs:ignore ?>
			</summary>
			<div class="faq__answer"><?php echo wp_kses_post( wpautop( $iim_item['answer'] ) ); ?></div>
		</details>
	<?php endforeach; ?>
</div>
