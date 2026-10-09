# IIM Technical Services: website rebuild

This repo replaces the Wix site at www.iimtechnicalservices.com with a custom WordPress theme (`iim`) and a core plugin (`iim-core`) for Hostinger.

| Read | For |
|---|---|
| [docs/01-current-site-audit.md](docs/01-current-site-audit.md) | What the old site contains, what was wrong, and the full URL inventory |
| [docs/placeholder-register.md](docs/placeholder-register.md) | Every fact, claim, photo and page awaiting client confirmation |
| [docs/seo-editing-guide.md](docs/seo-editing-guide.md) | How the SEO Manager edits titles, schema, redirects and content |
| [docs/runbook.md](docs/runbook.md) | Build, local setup, Hostinger, plugins, Cloudflare, Make/n8n, deploy, maintenance, incidents |
| [docs/redirects.csv](docs/redirects.csv) | Old Wix URL → new URL map (301s and 410s) |

## Quick start

```bash
npm install && npm run build
docker compose up -d                                 # http://localhost:8080, finish the WP install
docker compose run --rm cli wp plugin install secure-custom-fields --activate   # or upload ACF Pro
docker compose run --rm cli wp plugin activate iim-core
docker compose run --rm cli wp theme activate iim
docker compose run --rm cli wp iim seed
```

## Decisions that differ from the original brief

These were confirmed with the project owner on 9 October 2026, after auditing the live site:

1. **An AC services page was added** (`/services/ac-services-dubai/`). The live site sells AC cleaning, maintenance and repair.
2. **Brand colours come from the live site:** navy `#002366` and amber `#FFB800`, instead of the proposed `#0B1F3A` and `#F5A300`.
3. **Prices are stored but hidden.** The 13 AED prices published on the old `/book-online` page are in each service's price list. A master switch and a per-service switch keep them off until confirmed.
4. **The redirect map was extended** beyond the brief to cover 13 `/service-page/*` URLs, `/services-4-1`, `/book-online`, `/inquiry-services-page`, `/coming-soon-01`, 16 Arabic `/ar/*` URLs, and 410s for the 12 Wix demo-store products. See the audit.
5. **ACF field groups are registered in the plugin**, not the theme, so content structure survives a theme change. The theme's `inc/acf.php` only checks that ACF is present and reads fields.

## What is where

```
theme/iim       presentation: templates, template parts, tokens-based CSS, ES modules
plugins/iim-core data and logic: post types, fields, Business Info, roles, forms, leads, webhook,
                emails, schema, legacy redirects, hardening, SEO guards, WP-CLI
server/         .htaccess rules, wp-config additions, robots.txt for Rank Math
```

## Launch checklist (summary; details in the runbook)

- [ ] Client approves staging in writing
- [ ] Every item in the placeholder register is resolved or hidden; `wp iim check` is clean
- [ ] Titles, descriptions, canonicals and a single H1 verified on every page
- [ ] Redirects tested (no chains, no loops, nothing redirected to the home page in bulk)
- [ ] Quote form end to end: valid, invalid, spam, oversized upload, webhook down, JavaScript off
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility, Best Practices and SEO ≥ 95 on every template
- [ ] No horizontal scroll at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px
- [ ] Rich Results Test and Schema.org validator pass; securityheaders.com grade A; SSL Labs A
- [ ] Backup restore tested; 2FA on for every account; staging stays noindex, production is indexable
- [ ] Search Console and Bing Webmaster sitemaps submitted; GA4 events `quote_submit`, `whatsapp_click`, `phone_click`
- [ ] Google Business Profile name, address and phone match Business Info exactly
- [ ] Monitor Search Console for 404s and crawl errors for 4 weeks after launch
