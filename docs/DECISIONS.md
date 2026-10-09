# Decision log

Short architecture decision records. Newest last.

## ADR-001: Remove the WordPress build (9 Oct 2026)

**Context.** A WordPress version of the site (custom theme and plugin) was built and tested earlier on 9 Oct 2026. The owner then adopted `CLAUDE.md`, which specifies Next.js + Sanity.

**Decision.** Owner instruction: remove it. The theme, plugin, server config, build tooling and WordPress docs are deleted from the working tree. They remain in Git history (commits `16dc167`–`b8e5c8e`) and are not maintained.

**Kept as reference** (stack-independent): the live-site audit, the old-URL redirect map and the checked service copy, in `docs/reference/`.

## ADR-002: Colour palette matches the live site (9 Oct 2026)

**Context.** `CLAUDE.md` §7 proposed navy `#0b1f3a` + amber `#f5a300` "until the logo is supplied". The owner asked for a theme matching the current site.

**Evidence.** Colours sampled from the live homepage by on-screen area and text volume:

- Dark surfaces: black at 80% over photos, and charcoal `#1a1a1a` (header, service panels).
- Brand gold `#e6b215` (large panels) and amber `#ffb800` (headings, links, highlights).
- Cream `#f5f0de` (most body text, on dark).
- Navy `#002366` (text on white sections only).
- The logo is black and gold.

(An earlier stylesheet-only count over-weighted navy; the visual identity is charcoal + gold.)

**Decision.** Tokens in `CLAUDE.md` §7 replaced with an `ink` / `gold` / `accent` / `cream` / `navy` palette. Every text/background pair used was checked for WCAG 2.2 AA:

| Pair                      | Ratio |
| ------------------------- | ----- |
| ink-900 on accent         | 10.0  |
| ink-900 on gold           | 8.9   |
| cream on ink-900          | 15.3  |
| accent on ink-900         | 10.0  |
| navy on white             | 14.7  |
| navy on cream             | 12.9  |
| neutral-600 on white      | 6.1   |
| cream-muted on ink-900    | 9.9   |
| ink-900 on WhatsApp green | 8.8   |

Forbidden: amber or gold as text on white or cream (1.7), and white on amber or gold.

**Open.** Fonts stay as specified (Plus Jakarta Sans, Inter). The live site uses Anton (condensed) for its big headings; switching the display font is possible if the owner wants a closer match.

## ADR-003: Content Security Policy (9 Oct 2026)

**Options (Next.js 16.4 docs, "Content Security Policy" guide).**

1. **Nonces:** strictest, but every page must render per request, which disables static generation and ISR. That costs LCP and puts every visit on the Hostinger CPU. Rejected.
2. **Static CSP with `'unsafe-inline'`** for scripts: keeps static pages; weaker against injected inline script.
3. **Experimental SRI (`experimental.sri`)** with a static `script-src 'self'`: keeps static pages and is strict, but the docs note it can't cover dynamically generated scripts, and App Router streams inline data scripts.

**Decision (owner: "use the best one").** Use **3 if a real production build proves it works**: a Playwright test loads every template with the CSP and fails on any `securitypolicyviolation`. Otherwise use **2**, with every other directive strict (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors` limited to the Sanity Studio origin for Presentation). SRI stays on either way, so external chunks are integrity-checked. Report-Only first, then enforce (Phase 7).

**Verified outcome (9 Oct 2026, `tests/e2e/csp.spec.ts`, production build, Next 16.4.0).** Option 3 fails. With `script-src 'self'` plus SRI enforced:

- `/` reported 7 violations, `/services/plumbing-services-dubai/` 6 and `/get-a-quote/` 3, all from the inline RSC payload and bootstrap scripts.
- None of the three pages hydrated (the menu button did nothing).

With option 2 enforced, all three pages hydrated with zero violations. **Shipped: option 2 with SRI on.** `CSP_ALLOW_INLINE_SCRIPTS` defaults to on; set it to `false` only to re-run this experiment. The test stays in the suite, so a future Next release that removes the inline scripts will show up there. Switch `CSP_MODE=enforce` once a week of Report-Only data on staging shows no unexpected violations (MANUAL_TASKS).

## ADR-004: Base on the official Sanity + Next.js template (9 Oct 2026)

**Decision (owner).** Follow `sanity-io/sanity-template-nextjs-clean` (inspected at commit `2ad95bf`, 3 Aug 2026):

- npm-workspaces monorepo with `frontend/` (Next.js 16 App Router) and `studio/` (Sanity Studio).
- `next-sanity` (approved, including its `styled-components` peer for the Studio) with `defineLive` (`sanityFetch` / `SanityLive`), draft mode and the Presentation tool for click-to-edit visual editing.
- Typegen from the extracted schema.

**Adapted, not copied.**

- Dropped: Turbo, Vercel Speed Insights, the Unsplash and AI Assist plugins, `sonner`, the blog/person types and demo content.
- Content changes reach the site through `SanityLive` **and** a signed `/api/revalidate` webhook (live events rely on an open browser; the webhook doesn't).
- All content reads go through `frontend/lib/content/`, which falls back to typed local fixtures when no Sanity project is configured. The site, CI and tests then run before the client creates the Sanity project, and the same seed source produces the Sanity import file.
- `CLAUDE.md` §5's layout maps to `frontend/` (app, components, lib, styles, tests) and `studio/` (schemas, structure, seed).

**Versions.** TypeScript **5.9.3** and ESLint **9.39** (as used by the template). TypeScript 7.0 and ESLint 10 are not yet proven with Next 16 and `eslint-config-next`; revisit later.

## ADR-005: Build-phase decisions and the mobile performance pass (9 Oct 2026)

Smaller decisions taken while building, each with the reason. Items marked **owner** need the owner's OK because they depart from `CLAUDE.md`.

**1. Fixture mode with `groq-js` (dev dependency) — owner.** Until the Sanity project exists (MANUAL_TASKS T2), the same GROQ queries run locally against `frontend/content/seed/documents.json` using `groq-js` (Sanity's own GROQ engine). Site, CI and tests therefore need no Sanity account. `groq-js` is not on the allowed list in `CLAUDE.md` §4. It is loaded only when no project ID is set and never reaches the browser. If the owner says no, fixtures fall back to hand-written TypeScript getters (more code, and the queries are no longer exercised in CI).

**2. Two extra section types.** `checklist` and `callout` join the page-builder sections. They carry the "what's included" lists and safety notes from the checked seed copy, which didn't fit the existing types.

**3. 404s are rewritten in the proxy.** In Next 16.4 a page-level `notFound()` on a statically generated route renders the not-found UI only on the client: the HTML is an empty shell until JavaScript runs. That is bad for no-JS users and crawlers (reproduced with a minimal layout, independent of SRI, the proxy or draft mode). `proxy.ts` therefore knows the published slugs (60 s cache) and rewrites unknown ones to `/__not-found__/`. The 404 status and the full layout are then server-rendered. `notFound()` stays in the pages as a backstop.

**4. JavaScript budget measured without `noModule` polyfills.** Next ships its legacy polyfills with `noModule`, so modern browsers never download them. `scripts/check-budgets.mjs` excludes them. Framework baseline 132.6 KB gzipped; site code adds at most 30 KB (owner-approved budget).

**5. `?need=` pre-selects the service on the quote form.** Service pages link to `/get-a-quote/?need=<slug>`. Only known slugs are accepted.

**6. Mobile performance pass (Lighthouse 12.6, simulated slow 4G, moto G power profile, local production build).**

| Change                                                                                                                                                   | Effect on Lantern LCP                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next/image` → a server-rendered `<img>` (`components/ui/Img.tsx`, same Sanity CDN `srcset`)                                                             | −7 KB JS on every route that imported it; LCP within noise                                                                                               |
| Fonts trimmed to the weights and characters used (77 KB → 42 KB) and self-hosted with `next/font/local` — **owner** (CLAUDE.md names `next/font/google`) | about −0.3 s on every template                                                                                                                           |
| `<Suspense>` around the forms and nav (shorter hydration tasks)                                                                                          | **rejected**: React streamed them as hidden segments that need inline JS, breaking the no-JS form and strict CSP. A test now fails if that happens again |

Results after the pass (median of 3, local):

| Template                             | Perf  | LCP    | TBT        | CLS |
| ------------------------------------ | ----- | ------ | ---------- | --- |
| `/`                                  | 96    | 2.77 s | 66 ms      | 0   |
| `/services/`                         | 94    | 2.77 s | 176 ms     | 0   |
| `/services/plumbing-services-dubai/` | 94    | 2.60 s | 179 ms     | 0   |
| `/annual-maintenance-contract/`      | 91    | 2.51 s | 300 ms     | 0   |
| `/areas/`                            | 96    | 2.53 s | 136 ms     | 0   |
| `/get-a-quote/`                      | 94    | 2.76 s | 151 ms     | 0   |
| `/contact/`                          | 87–91 | 2.77 s | 250–370 ms | 0   |

Accessibility, best practices and SEO score 100 / 96 / 100 everywhere.

**Why LCP is still about 2.5–2.8 s.** The LCP element is text, painted with the first frame (about 0.2 s unthrottled). Lighthouse's simulator also counts every request that finished before that paint, which includes the framework JavaScript (about 130 KB). A bare Next 16 page with no fonts, CSS or site code already scores about 2.0 s. The remaining gap is the brand fonts and the site's own CSS and JS.

**Remaining options, for the owner:**

- (a) System fonts for body text (about −0.2 s).
- (b) Accept the lab result and judge by field data (CrUX/PageSpeed on staging behind Cloudflare: Brotli, HTTP/3).
- (c) A real hero photo becomes the LCP element on most pages once supplied (PLACEHOLDERS B3), which changes the picture again.

**Until decided:** LHCI fails on any category below target (performance 90, the others 95) and on CLS, and **warns** on LCP over 2.5 s. A permanently red CI would hide new regressions.

**7. Sanity icons.** `@sanity/icons` 5 exports one module per icon (`@sanity/icons/Cog`), not named exports from the package root. The Studio imports them that way; the Studio build in CI catches regressions.
