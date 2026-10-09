<?php
/**
 * Customer photo uploads: images only (JPG, PNG, WebP), 8 MB each, max 3, MIME checked from file
 * contents, random names, stored in a protected folder that the web server refuses to serve.
 * Staff open them through an authenticated admin download link.
 *
 * @package iim-core
 */

defined( 'ABSPATH' ) || exit;

const IIM_CORE_MAX_FILES = 3;
const IIM_CORE_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Absolute path of the protected folder.
 */
function iim_core_upload_dir() {
	$uploads = wp_upload_dir( null, false );
	return trailingslashit( $uploads['basedir'] ) . 'iim-leads';
}

/**
 * Create the folder with deny rules (Apache/LiteSpeed .htaccess, plus an empty index).
 */
function iim_core_protect_upload_dir() {
	$dir = iim_core_upload_dir();
	if ( ! wp_mkdir_p( $dir ) ) {
		return false;
	}
	$htaccess = $dir . '/.htaccess';
	if ( ! file_exists( $htaccess ) ) {
		file_put_contents( $htaccess, "# IIM Core: customer uploads are never served directly.\nRequire all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	}
	if ( ! file_exists( $dir . '/index.php' ) ) {
		file_put_contents( $dir . '/index.php', "<?php\n// Silence.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	}
	return true;
}

/**
 * Normalise $_FILES['photos'] (multi-file input) into a list.
 *
 * @param array $files Raw files array from the request.
 * @return array<int,array{name:string,type:string,tmp_name:string,error:int,size:int}>
 */
function iim_core_normalise_files( $files ) {
	if ( empty( $files['photos'] ) || ! is_array( $files['photos']['name'] ?? null ) ) {
		return array();
	}
	$list = array();
	foreach ( $files['photos']['name'] as $i => $name ) {
		if ( UPLOAD_ERR_NO_FILE === (int) $files['photos']['error'][ $i ] ) {
			continue;
		}
		$list[] = array(
			'name'     => (string) $name,
			'type'     => (string) $files['photos']['type'][ $i ],
			'tmp_name' => (string) $files['photos']['tmp_name'][ $i ],
			'error'    => (int) $files['photos']['error'][ $i ],
			'size'     => (int) $files['photos']['size'][ $i ],
		);
	}
	return $list;
}

/**
 * Validate uploads without moving them.
 *
 * @param array $files Normalised list.
 * @return true|string Error message.
 */
function iim_core_validate_files( $files ) {
	if ( count( $files ) > IIM_CORE_MAX_FILES ) {
		/* translators: %d: max files. */
		return sprintf( __( 'You can attach up to %d photos.', 'iim-core' ), IIM_CORE_MAX_FILES );
	}
	foreach ( $files as $file ) {
		if ( UPLOAD_ERR_INI_SIZE === $file['error'] || UPLOAD_ERR_FORM_SIZE === $file['error'] || $file['size'] > IIM_CORE_MAX_BYTES ) {
			return __( 'Each photo must be 8 MB or smaller.', 'iim-core' );
		}
		if ( UPLOAD_ERR_OK !== $file['error'] || ! is_uploaded_file( $file['tmp_name'] ) ) {
			return __( 'A photo could not be uploaded. Please try again.', 'iim-core' );
		}
		if ( ! iim_core_detect_image_mime( $file['tmp_name'] ) ) {
			return __( 'Photos must be JPG, PNG or WebP.', 'iim-core' );
		}
	}
	return true;
}

/**
 * Detect the real image type from the file contents (never trust the browser's type or extension).
 *
 * @param string $path File path.
 * @return string|false Extension (jpg|png|webp) or false.
 */
function iim_core_detect_image_mime( $path ) {
	$allowed = array(
		'image/jpeg' => 'jpg',
		'image/png'  => 'png',
		'image/webp' => 'webp',
	);
	$mime = '';
	if ( function_exists( 'finfo_open' ) ) {
		$finfo = finfo_open( FILEINFO_MIME_TYPE );
		$mime  = (string) finfo_file( $finfo, $path );
		finfo_close( $finfo );
	}
	$info = @getimagesize( $path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors -- invalid images return false.
	if ( ! $info || empty( $info['mime'] ) ) {
		return false;
	}
	if ( $mime && $mime !== $info['mime'] ) {
		return false;
	}
	return $allowed[ $info['mime'] ] ?? false;
}

/**
 * Move validated files into the protected folder under random names.
 *
 * @param array  $files Normalised list (already validated).
 * @param string $ref   Lead reference, used as a sub-folder.
 * @return string[] Stored file names (relative to the protected folder).
 */
function iim_core_store_files( $files, $ref ) {
	if ( ! $files || ! iim_core_protect_upload_dir() ) {
		return array();
	}
	$sub = sanitize_file_name( strtolower( $ref ) );
	$dir = iim_core_upload_dir() . '/' . $sub;
	wp_mkdir_p( $dir );

	$stored = array();
	foreach ( $files as $file ) {
		$ext = iim_core_detect_image_mime( $file['tmp_name'] );
		if ( ! $ext ) {
			continue;
		}
		$name = wp_generate_password( 24, false, false ) . '.' . $ext;
		if ( move_uploaded_file( $file['tmp_name'], $dir . '/' . $name ) ) {
			chmod( $dir . '/' . $name, 0640 ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_chmod
			$stored[] = $sub . '/' . $name;
		}
	}
	return $stored;
}

/**
 * Authenticated download of a lead photo: /wp-admin/admin-post.php?action=iim_lead_file&lead=ID&file=N.
 */
add_action(
	'admin_post_iim_lead_file',
	function () {
		$lead_id = isset( $_GET['lead'] ) ? absint( $_GET['lead'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- checked below.
		$index   = isset( $_GET['file'] ) ? absint( $_GET['file'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		check_admin_referer( 'iim_lead_file_' . $lead_id );

		if ( ! $lead_id || ! current_user_can( 'edit_post', $lead_id ) || 'lead' !== get_post_type( $lead_id ) ) {
			wp_die( esc_html__( 'You are not allowed to view this file.', 'iim-core' ), 403 );
		}
		$files = (array) get_post_meta( $lead_id, '_iim_files', true );
		$rel   = $files[ $index ] ?? '';
		$path  = realpath( iim_core_upload_dir() . '/' . $rel );
		$base  = realpath( iim_core_upload_dir() );
		if ( ! $rel || ! $path || ! $base || 0 !== strpos( $path, $base . DIRECTORY_SEPARATOR ) || ! is_file( $path ) ) {
			wp_die( esc_html__( 'File not found.', 'iim-core' ), 404 );
		}
		$ext  = strtolower( pathinfo( $path, PATHINFO_EXTENSION ) );
		$mime = array( 'jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' )[ $ext ] ?? 'application/octet-stream';
		nocache_headers();
		header( 'Content-Type: ' . $mime );
		header( 'Content-Length: ' . filesize( $path ) );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Content-Disposition: inline; filename="' . basename( $path ) . '"' );
		readfile( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		exit;
	}
);

/**
 * Signed admin URL for one lead file.
 *
 * @param int $lead_id Lead.
 * @param int $index   File index.
 */
function iim_core_lead_file_url( $lead_id, $index ) {
	return wp_nonce_url( admin_url( 'admin-post.php?action=iim_lead_file&lead=' . (int) $lead_id . '&file=' . (int) $index ), 'iim_lead_file_' . (int) $lead_id );
}

/**
 * Delete a lead's files when the lead is permanently deleted.
 */
add_action(
	'before_delete_post',
	function ( $post_id ) {
		if ( 'lead' !== get_post_type( $post_id ) ) {
			return;
		}
		$base = realpath( iim_core_upload_dir() );
		foreach ( (array) get_post_meta( $post_id, '_iim_files', true ) as $rel ) {
			$path = realpath( iim_core_upload_dir() . '/' . $rel );
			if ( $path && $base && 0 === strpos( $path, $base . DIRECTORY_SEPARATOR ) && is_file( $path ) ) {
				wp_delete_file( $path );
			}
		}
		$ref = get_post_meta( $post_id, '_iim_ref', true );
		if ( $ref ) {
			$dir = iim_core_upload_dir() . '/' . sanitize_file_name( strtolower( $ref ) );
			if ( is_dir( $dir ) ) {
				@rmdir( $dir ); // phpcs:ignore -- only succeeds when empty.
			}
		}
	}
);
