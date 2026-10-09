# Manual tasks (need a human with account access)

Updated 9 Oct 2026 (end of Phase 1). Each task says who does it and what to send back to the developer. Never paste secrets into chat or the repo: share them through the password manager and enter them in the host's environment settings.

## T1. GitHub (now)

1. ~~Make the repository private~~ **Done 9 Oct 2026** (verified: anonymous access returns 404).
2. Turn on 2FA for every account with access.
3. **Settings → Branches → Add rule** for `main`: require a pull request, require the status checks **CI / Lint, types, tests, build, budgets, e2e, Lighthouse** and **CI / Sanity Studio build** (`.github/workflows/ci.yml`; they appear in the list after the first run), and block force pushes.
4. **Settings → Code security**: enable Dependabot alerts and security updates.
5. Later, for Lighthouse CI and e2e: add repository secrets only if a job needs them (none planned; CI uses mocks).

**Send back:** confirmation that it's private, and whether the developer account should be added as a collaborator.

## T2. Sanity (before Phase 2)

1. Sign up at sanity.io with the business Google account (owner) and enable 2FA.
2. Create a project "IIM Technical Services", plan **Free**, dataset `production` (public; the free plan has no private datasets).
3. **Project → Members**: check which **two permission roles** the free plan offers. The SEO specialist needs a role that can create, edit and publish. Invite the developer as Administrator.
4. **API → CORS origins**: add `http://localhost:3000`, the staging URL, `https://www.iimtechnicalservices.com` and the Studio URL (`https://<name>.sanity.studio`). Credentials **off** for the site origins.
5. **API → Webhooks** (after staging exists): create "Revalidate site", URL `https://<staging-or-prod>/api/revalidate/` (with the trailing slash), trigger on create, update and delete for all types, projection `{_type, "slug": slug.current}`, a **secret** (generate 32+ random characters), HTTP method POST.
6. **API → Tokens → Add API token**, role **Viewer**, name "Website draft mode". It goes into `SANITY_API_READ_TOKEN` on the host (server only). It lets editors preview drafts through the Presentation tool.
7. With the developer: deploy the Studio (`npm run deploy --workspace=studio`, which asks you to log in and pick a `<name>.sanity.studio` host). Then import the starting content once: `npm run seed:export`, then `npm run seed:import --workspace=studio`. **This replaces the dataset**: only on the new, empty project.

**Send back:** project ID (not secret), the Studio URL, confirmation of the available roles, and the webhook secret and Viewer token via the password manager (`SANITY_REVALIDATE_SECRET`, `SANITY_API_READ_TOKEN`).

## T3. Hostinger (before the end of Phase 1)

Check and report (screenshots are fine):

1. Plan name and its Node.js limits: number of web apps, RAM, CPU, **build memory and timeout**, process restart policy.
2. **Node versions offered** (we want 24 LTS; minimum 22.12 because of Sanity).
3. Whether a web app can be connected to a **private** GitHub repo and branch, and whether the build and start commands are editable (`npm ci && npm run build` / `npm run start`).
4. Where environment variables are set, and whether they're available at build time.
5. Whether `.next/cache` persists between restarts (it's fine if it's cleared on deploy).
6. Whether outbound SMTP (465/587) and HTTPS to Make/n8n are allowed.
7. Whether a second app can run the `staging` branch on `staging.iimtechnicalservices.com`.
8. Turn on 2FA for the hPanel login.
9. **Origin lock:** whether the app can accept traffic **only from Cloudflare** (firewall allow-list of Cloudflare IP ranges, or Hostinger's own Cloudflare integration). Without it, someone can reach the server directly, send a fake `CF-Connecting-IP` header and get round the per-IP form limit. The Cloudflare rate-limit rule (T5.3) still protects requests that go through Cloudflare.

## T4. Domain and DNS (before staging; DNS switch only on launch day)

1. Confirm who controls the registrar for `iimtechnicalservices.com` and that you can log in.
2. Add the domain to Cloudflare (free plan) and copy the existing records exactly (especially MX, SPF, any Google verification TXT records). Do **not** change nameservers yet.
3. One day before launch, lower the TTLs. On launch day, change the nameservers to Cloudflare, then point `www` and the apex at Hostinger.

## T5. Cloudflare (with T4)

1. SSL/TLS mode **Full (strict)**; Always Use HTTPS on. HSTS only after a week of clean HTTPS.
2. **Turnstile**: add a widget (Managed) for `www.iimtechnicalservices.com`, the staging host and `localhost`. Send the site key (public) and the secret key (password manager).
3. **Rate limiting rule**: path `/api/quote`, method POST, more than 5 requests in 10 minutes per IP → block for 1 hour. (The free plan's rule options vary; use the closest match and tell the developer what was set.)
4. **Cache rules**: bypass cache for `/api/*`, for HTML pages, and for any URL containing `?ref=`. Cache everything static (`/_next/static/*`) per origin headers.
5. **Redirect rule**: `iimtechnicalservices.com/*` → `https://www.iimtechnicalservices.com/${1}`, 301.
6. WAF managed free rules: on.

## T6. Email sending (before Phase 5 testing)

1. Create or choose a mailbox for sending, such as `no-reply@iimtechnicalservices.com` (Hostinger email or Google Workspace).
2. Add or verify **SPF**, **DKIM** and **DMARC** (`v=DMARC1; p=none; rua=mailto:<owner>` for 2 weeks, then `p=quarantine`).
3. Send the developer the SMTP host, port and username, and the password via the password manager.

## T7. Google Sheet and automation (Phase 5)

1. Create a Google Sheet "IIM Leads" with a tab **Leads** and these columns in this order:
   `ref, created_at, type, status, name, phone, email, service, emirate, area, address, preferred_date, preferred_time, description, source_page, utm_source, utm_medium, utm_campaign, contract_start, renewal_date, reminded_30, reminded_7, owner_notes`.
   Add data validation on `status`: New, Contacted, Quoted, Booked, Done, Lost.
   The full column list, including `property_type` and `plan` for contract applications, is in [LEAD_AUTOMATION.md](LEAD_AUTOMATION.md) §4. Use that one; it supersedes the list above.
2. Create a Make (or n8n) account with 2FA. Build the two scenarios from [LEAD_AUTOMATION.md](LEAD_AUTOMATION.md), including the signature check, and paste the webhook URL into `LEAD_WEBHOOK_URL` (with the shared HMAC secret in `LEAD_WEBHOOK_SECRET`).
3. Decide how the owner gets lead alerts: WhatsApp (needs a WhatsApp Business API provider or Twilio, paid) or the free fallback (email + Telegram bot).

## T8. Analytics and search (Phase 6–8)

1. GA4 property → send the Measurement ID (public).
2. Search Console: the site is already verified with an HTML meta tag on the old Wix site. Add a **Domain property via DNS TXT** so verification survives the move. Add Bing Webmaster Tools.
3. After launch: submit `/sitemap.xml`, and watch Coverage and 404s for four weeks.

## T9. Client inputs

Everything in `PLACEHOLDERS.md` sections A–C. The ones that block design work soonest: logo files (B1), colours (B2), service list (A14) and phone/email (A1–A3).

## T10. Font licence file (before launch)

Add the official SIL Open Font License 1.1 text as `frontend/fonts/OFL.txt` (from https://openfontlicense.org/open-font-license-official-text/). The trimmed fonts are redistributed in the repository, and the OFL requires the licence to travel with them. See `frontend/fonts/README.md`.

## T11. Environment variables on Hostinger (with T3)

Enter the variables listed in [RUNBOOK.md](RUNBOOK.md) §2 for production (and staging). A missing required value stops the app at start-up with a message naming it. `NEXT_PUBLIC_*` values need a rebuild after a change.

## T12. Enforce the Content Security Policy (one week after staging is live)

The CSP ships in Report-Only mode. After a week of normal use on staging, including the Studio's Presentation tool, check the browser consoles for CSP reports. If nothing unexpected shows up, set `CSP_MODE=enforce` on staging, test the forms and Presentation, then on production. Background: [DECISIONS.md](DECISIONS.md) ADR-003.

## T13. Owner decisions from the build (ADR-005)

**Done 9 Oct 2026.** `groq-js` and the trimmed self-hosted fonts are kept. Mobile LCP (2.5–2.8 s in the lab) is judged by field data on staging (T14).

## T14. Check real-world speed (once staging runs behind Cloudflare)

1. Run PageSpeed Insights (mobile) on `/`, `/services/plumbing-services-dubai/`, `/get-a-quote/` and `/contact/`. Send the developer the LCP and performance score of each.
2. After launch, check Search Console → **Core Web Vitals** monthly. If mobile LCP is "Needs improvement" or "Poor", tell the developer: the next step is system fonts for body text (ADR-005).
