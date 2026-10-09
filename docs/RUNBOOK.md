# Runbook

Day-to-day operation of the live site: deploy, roll back, back up, and what to do when something breaks. Hostinger specifics marked _(T3)_ are filled in once the hosting checks in MANUAL_TASKS T3 come back.

## 1. Environments

|                | Production                           | Staging                                                                     |
| -------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| URL            | https://www.iimtechnicalservices.com | https://staging.iimtechnicalservices.com _(T3: if a second app is allowed)_ |
| Branch         | `main`                               | `staging`                                                                   |
| `SITE_ENV`     | `production`                         | `staging` (Basic Auth + `noindex`)                                          |
| Sanity dataset | `production`                         | `production` (drafts previewed through draft mode)                          |

## 2. Environment variables (Hostinger app settings)

Never in the repository. `frontend/.env.example` lists every variable with a comment. A production or staging build **refuses to start** if a required one is missing (`frontend/lib/env.ts`), and names it.

Required on production and staging:

- Sanity and site: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_REVALIDATE_SECRET`
- Lead webhook: `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`
- Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- Email: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `OWNER_EMAIL`

Also set:

- `SITE_ENV`, `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_STUDIO_URL`: the Studio origin, used in the CSP `frame-ancestors` for Presentation
- `SANITY_API_READ_TOKEN`: Viewer role, for draft mode
- `STAGING_BASIC_AUTH`: staging only, `user:password`
- `CSP_MODE`: `report-only` until MANUAL_TASKS T12, then `enforce`
- `NEXT_PUBLIC_GA_ID`: optional

`NEXT_PUBLIC_*` values are built into the pages, so **changing one needs a rebuild**, not just a restart.

## 3. Deploy

Normal path: merge a pull request into `main` after CI is green. Then deploy:

1. Hostinger pulls `main` _(T3: automatic on push, or "Deploy" in hPanel)_.
2. Build command `npm ci && npm run build`; start command `npm run start`. Node 24 (minimum 22.12).
3. After the deploy, check:
   - `/` returns 200.
   - `/robots.txt` allows crawling (production only).
   - `/sitemap.xml` lists `https://www.` URLs.
   - Submit a test quote with your own phone number. A row appears in the Sheet and the owner email arrives. Then mark the row `Lost` with note "test".
4. Purge Cloudflare's cache only if an asset is stale. HTML is not cached by Cloudflare (MANUAL_TASKS T5).

Content edits in Sanity need no deploy: the site updates within seconds through the revalidation webhook (MANUAL_TASKS T2).

## 4. Roll back

1. **Fastest:** in hPanel, redeploy the previous successful deployment _(T3: confirm the option exists)_.
2. **Always works:** `git revert <bad commit>` on a branch, open a PR, merge when CI is green, deploy. Don't force-push `main`.
3. A bad **content** change: in Sanity open the document, then **History**, and restore the previous version. Publishing again triggers revalidation.
4. A bad **redirect**: unpublish or fix the `redirect` document. The site reloads redirects every 60 seconds.

## 5. Backups

| What           | How                                                                                                                                                                                                   | When                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Code           | GitHub (private repo)                                                                                                                                                                                 | Every push                    |
| Sanity content | `cd studio && npx sanity dataset export production backups/production-YYYY-MM-DD.tar.gz` (includes images). Store it outside the repo (owner's Google Drive). The free plan has no automatic backups. | Weekly, and before bulk edits |
| Leads          | Google Sheet version history; also every lead is in the owner's email                                                                                                                                 | Continuous                    |
| Seed           | `frontend/content/seed/documents.json` rebuilds a fresh dataset (`npm run seed:export`, then `npm run seed:import --workspace=studio`). **This replaces the dataset**: only for a new, empty project. | —                             |

To restore Sanity from an export: `npx sanity dataset import <file> production --replace`. Run it on a **copy** dataset first if the plan allows one.

## 6. Incidents

**Site down or 5xx**

1. Check Hostinger's app status and logs _(T3: where)_. A missing environment variable shows up as a clear error at start.
2. Restart the app. If a deploy caused it, roll back (section 4).
3. Cloudflare "origin unreachable" (521/522): Hostinger is down. Ask its support, and post the phone number on the Google Business Profile in the meantime.

**Leads not arriving**

- The owner gets emails beginning `[WEBHOOK FAILED]`: the Make/n8n scenario is off or rejecting requests. Check its run history. The lead details are in the email; add them to the Sheet by hand.
- No emails at all: test SMTP (wrong password, or SPF/DKIM failing). The site returns an error to the visitor only when **both** the webhook and the owner email fail, so a silent drop shouldn't happen. Check the app logs for `lead_processed` lines with `"webhook":false,"ownerEmail":false`. They carry the `ref` and no personal data.
- Spam getting through: check that Turnstile keys are set (the form shows the widget), and that the Cloudflare rate-limit rule is on (T5). The site also limits each IP to 5 submissions an hour.

**Content not updating**

- Sanity → API → Webhooks → "Revalidate site" → **Attempts**: should show 200. A 401 means the secrets differ. A 500 "Not configured" means `SANITY_REVALIDATE_SECRET` is missing on the host.
- As a stopgap, redeploy: the build fetches everything fresh.

**Security**

- CSP reports: in Report-Only mode, violations show in browser consoles. Use them to decide when to enforce (T12).
- Suspected key leak: rotate it at the source (Sanity token, Turnstile secret, SMTP password, webhook secret), update Hostinger, rebuild. The webhook secret must change on both the site and the scenario at once.
- Dependency alerts: Dependabot opens PRs. Merge them once CI is green.

## 7. Routine checks

- Weekly: Sanity export; skim Search Console for new 404s, then add `redirect` documents for real old URLs.
- Monthly: `npm outdated` and patch updates via PR; run PageSpeed Insights on the homepage and one service page (mobile).
- Before any big content change: an export.
