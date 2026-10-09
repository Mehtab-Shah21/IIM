<?php
/**
 * Add these lines to wp-config.php on each server, ABOVE "That's all, stop editing!".
 * Real values live only on the server and in the password manager, never in Git.
 */

// Environment: 'local', 'staging' or 'production'. Anything but production is noindex, nofollow.
define( 'WP_ENVIRONMENT_TYPE', 'staging' );

// Hardening.
define( 'DISALLOW_FILE_EDIT', true );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
define( 'DISABLE_WP_CRON', true );      // Real cron in hPanel: */5 * * * * wget -q -O - https://www.iimtechnicalservices.com/wp-cron.php?doing_wp_cron >/dev/null 2>&1
define( 'WP_POST_REVISIONS', 10 );
define( 'WP_MEMORY_LIMIT', '256M' );

// Custom login URL (no slashes). Share only through the password manager.
define( 'IIM_LOGIN_SLUG', 'CHANGE-ME-staff-login' );

// Lead delivery to Make / n8n (Google Sheet row + WhatsApp alert to the owner).
define( 'IIM_WEBHOOK_URL', 'https://hook.eu1.make.com/CHANGE-ME' );
define( 'IIM_WEBHOOK_SECRET', 'CHANGE-ME-64-random-characters' );

// Cloudflare Turnstile (create a widget for www.iimtechnicalservices.com and the staging host).
define( 'IIM_TURNSTILE_SITE_KEY', 'CHANGE-ME' );
define( 'IIM_TURNSTILE_SECRET_KEY', 'CHANGE-ME' );

// Trust CF-Connecting-IP only when the origin accepts traffic from Cloudflare IPs only.
define( 'IIM_TRUST_CF_IP', true );

// Only if the host cannot set headers in .htaccess (server/security-headers.conf is preferred).
// define( 'IIM_SEND_SECURITY_HEADERS', true );

// FluentSMTP: keep SMTP credentials out of the database.
// define( 'FLUENTMAIL_SMTP_USERNAME', 'no-reply@iimtechnicalservices.com' );
// define( 'FLUENTMAIL_SMTP_PASSWORD', 'CHANGE-ME' );
