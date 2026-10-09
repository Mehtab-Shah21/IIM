# Runbook: build, deploy, operate

## 1. Repository layout

```
theme/iim/            Classic PHP theme (presentation only)
  assets/src/         Hand-written CSS (tokens first) and ES modules
  assets/dist/        Built output (committed, so the server needs no Node)
  inc/                setup, enqueue, performance, security, acf, nav, schema-hooks, helpers, templates
  template-parts/     header, footer, hero parts, cards, faq, cta-band, forms, sections…
  templates/          front-page, archives, singles, page templates (About, AMC, Contact, Quote…)
plugins/iim-core/     Data and logic that survive a theme change
  includes/           post types, ACF fields, Business Info, roles, form security, uploads, leads,
                      webhook, mail, REST, schema, legacy redirects, hardening, SEO guards, admin, CLI
  seed/content.json   Seed copy (validated: answers 40–60 words, titles ≤ 60, descriptions 140–155)
server/               .htaccess rules (headers, canonical host, caching), wp-config additions, robots.txt
docs/                 Audit, placeholder register, editing guide, this runbook, redirects.csv
```

## 2. Build

```bash
npm install
npm run build      # CSS + JS + fonts + icon sprite, then checks budgets (CSS < 60 KB, JS < 50 KB gzip)
npm run watch      # during development
```

Current output: CSS 37 KB raw / 8 KB gzip (critical CSS inlined), JS 4 KB gzip (the form module loads only on pages with a form).

## 3. Local development

Any local WordPress works (LocalWP, DDEV, or `docker compose up` with the included `docker-compose.yml`). Symlink or mount `theme/iim` into `wp-content/themes/iim` and `plugins/iim-core` into `wp-content/plugins/iim-core`. Then:

```bash
wp plugin install advanced-custom-fields-pro.zip seo-by-rank-math litespeed-cache wordfence wp-2fa updraftplus fluent-smtp --activate
wp plugin activate iim-core && wp theme activate iim
wp iim seed            # pages, 7 services, FAQs, testimonials (hidden), Rank Math meta
wp rewrite flush
```

WordPress creates a draft "Privacy Policy" page on install; run `wp iim seed --update` or delete it first so the seeded draft replaces it.

## 4. Hostinger setup (once)

1. Plan: Business or Cloud (LiteSpeed, PHP 8.3+, SSH, Git). Data centre: the lowest-latency option to the UAE offered in hPanel. Check plan limits against this spec before buying.
2. hPanel → Websites → create the site, PHP 8.3, `memory_limit 256M`, `upload_max_filesize 32M`, `post_max_size 32M`, `max_input_vars 5000` (ACF).
3. SSL: install the free certificate, *Force HTTPS* on.
4. **Staging**: hPanel → WordPress → Staging. Protect it with a password (hPanel → Password Protect Directories). `WP_ENVIRONMENT_TYPE = 'staging'` makes it noindex, nofollow automatically.
5. Cron: set `DISABLE_WP_CRON` and add the real cron job from `server/wp-config-additions.php` (every 5 minutes; webhook retries rely on it).
6. Paste `server/security-headers.conf` above `# BEGIN WordPress` in `.htaccess`.
7. Add `server/wp-config-additions.php` lines with real values (from the password manager).
8. Backups: Hostinger daily backups **and** UpdraftPlus → Google Drive or S3 (daily database, weekly files, 30-day retention). **Test a restore on staging** before launch.

## 5. Deploy (never edit live files)

```bash
npm run build && git add -A && git commit -m "…" && git push
# On the server (SSH), keeping the previous release for rollback:
cd ~/releases && git -C repo pull && TS=$(date +%Y%m%d%H%M) && cp -r repo "$TS"
rsync -a --delete "$TS/theme/iim/" ~/public_html/wp-content/themes/iim/
rsync -a --delete "$TS/plugins/iim-core/" ~/public_html/wp-content/plugins/iim-core/
wp litespeed-purge all
```

Rollback: rsync the previous timestamped folder back and purge the cache.

## 6. Plugin configuration

**LiteSpeed Cache**
- Cache: on. Cache logged-in users: off. Cache REST API: **off**.
- Do-not-cache URIs: `/wp-json/iim/`, `/thank-you/`. Do-not-cache query strings: `iim_form`, `ref`.
- CSS/JS minify: on. **CSS combine, JS combine, "Load CSS asynchronously", JS defer/delay: off.** The theme already inlines critical CSS and loads one deferred module; LiteSpeed's versions would break the CSP hash and the module loader.
- Image optimisation: WebP (and AVIF if offered) on. Lazy load images: **off** (the theme sets `loading` and `fetchpriority` itself).
- Browser cache: on. Crawler (preload): on.

**Rank Math**
- Setup wizard: Advanced. Site type: *Small Business* → *Local Business*, then let iim-core supply the LocalBusiness node (set the Rank Math business type to Organization so there is only one business node).
- Titles & Meta → Global: separator `|`; default OG image 1200×630.
- Post types: Services, Areas, Projects, Guides indexable with templates; Testimonials, FAQs, Leads not public (they never appear).
- Sitemap: on (`/sitemap_index.xml`). Exclude the Style guide and Thank-you pages.
- Breadcrumbs: **on**.
- robots.txt: paste `server/robots.txt`.
- Redirections: on (the legacy Wix map is already handled by iim-core; see `docs/redirects.csv`).
- Role Manager: confirm the SEO Manager role has the Rank Math capabilities.

**Wordfence**: firewall in extended mode, brute-force protection (lock out after 5 failures), weekly scan email to the developer, file-change monitoring on.

**WP 2FA**: enforce for Administrator, Editor, SEO Manager. Grace period 3 days.

**FluentSMTP**: authenticated SMTP from the domain mailbox (e.g. Google Workspace or Zoho). Set SPF, DKIM and DMARC (`p=quarantine` after a week of `p=none` reports). Send a test to Gmail and Outlook.

**UpdraftPlus**: see 4.8.

## 7. Cloudflare (free)

- DNS proxied (orange cloud) for `www` and apex. SSL/TLS mode **Full (strict)**. Always Use HTTPS on.
- Turnstile: create a *Managed* widget for the production and staging hosts and put the keys in `wp-config.php`.
- Cache rules: **Bypass** cache for `/wp-json/*`, `/wp-admin/*`, `/wp-login.php`, the custom login slug, and any URL with `iim_form=`. Leave HTML caching to LiteSpeed.
- WAF: managed free rules on. Rate-limit rule (optional): `/wp-json/iim/v1/lead` 10 requests per minute per IP.
- After moving to Cloudflare, restrict origin access to Cloudflare IP ranges, then set `IIM_TRUST_CF_IP` to `true`.

## 8. Lead automation (Make or n8n)

**Scenario 1: new lead** (webhook trigger)
1. *Custom webhook* receives JSON `{ event, lead: {...} }` with header `X-IIM-Signature: t=<unix>,v1=<hex>`.
2. Verify: compute HMAC-SHA256 of `"<t>.<raw body>"` with the shared secret and compare with `v1`. Reject if different or if `t` is older than 5 minutes. (Make: `sha256(…; ; secret)`. n8n: Crypto node → HMAC.)
3. Google Sheets → *Add a row* to the **Leads** tab: reference, submitted_at, form, service_label, plan, name, phone, email, location, emirate, property_type, preferred_date, preferred_time, issue, photos, flags, admin_url.
4. WhatsApp alert **to the owner only** (this phase): WhatsApp Cloud API template message, or the provider the client already uses. Content: reference, service, name, phone, area, preferred time, plus the `whatsapp_link` for one-tap reply.
5. Respond **200** only after the row is added. Any non-2xx makes WordPress retry (5 min, 15 min, 1 h, 6 h, 24 h), then flag the lead and email the owner.

Test with `wp iim test-webhook`.

**Scenario 2: contract renewal reminders** (schedule: daily 08:00 Asia/Dubai)
1. Google Sheets → *Search rows* in the **Contracts** tab (columns: reference, customer, phone, email, plan, start_date, renewal_date, owner_notes).
2. Filter where `renewal_date − today` is exactly 30 or 7 days.
3. WhatsApp/email to the owner: "Contract <reference> for <customer> renews on <date>".
4. Optional (when approved): email to the customer at the same points.

## 9. Maintenance

**Weekly**: review and apply plugin/core updates on staging first, then production; check UpdraftPlus ran; check uptime; send a test quote (`/get-a-quote/`) and confirm the Sheet row, WhatsApp alert and both emails.

**Monthly**: Wordfence scan review; Search Console (coverage, Core Web Vitals, 404s); broken-link scan; `wp iim check`.

**Quarterly**: restore test from backup onto staging.

## 10. Incident checklist

| Situation | Action |
|---|---|
| Site down | Check Hostinger status → hPanel error logs → disable the last updated plugin over SSH (`wp plugin deactivate x`) → restore the last backup if needed. |
| Hacked / defaced | Put the site in maintenance mode, restore a clean backup, then **rotate everything**: WP passwords, `wp-config` salts (`wp config shuffle-salts`), DB password, `IIM_WEBHOOK_SECRET` (update Make/n8n too), Turnstile keys, SMTP password. Run a Wordfence scan. Review users. |
| Leads not arriving | Leads → filter *failed*; `wp iim retry-webhooks`; check the Make/n8n scenario history; check FluentSMTP logs. Leads are always saved in WordPress first. |
| Spam wave | Check Turnstile keys; tighten the Cloudflare rate-limit rule; review lead flags `no_js` and `nonce_stale`. |

Contacts: developer (Administrator), Hostinger support (hPanel chat), Cloudflare account owner, domain registrar [CONFIRM].
