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

| Pair | Ratio |
|---|---|
| ink-900 on accent | 10.0 |
| ink-900 on gold | 8.9 |
| cream on ink-900 | 15.3 |
| accent on ink-900 | 10.0 |
| navy on white | 14.7 |
| navy on cream | 12.9 |
| neutral-600 on white | 6.1 |
| cream-muted on ink-900 | 9.9 |
| ink-900 on WhatsApp green | 8.8 |

Forbidden: amber or gold as text on white or cream (1.7), and white on amber or gold.

**Open.** Fonts stay as specified (Plus Jakarta Sans, Inter). The live site uses Anton (condensed) for its big headings; switching the display font is possible if the owner wants a closer match.

## ADR-003: Content Security Policy (9 Oct 2026)

**Options (Next.js 16.4 docs, "Content Security Policy" guide).**
1. **Nonces:** strictest, but every page must render per request, which disables static generation and ISR. That costs LCP and puts every visit on the Hostinger CPU. Rejected.
2. **Static CSP with `'unsafe-inline'`** for scripts: keeps static pages; weaker against injected inline script.
3. **Experimental SRI (`experimental.sri`)** with a static `script-src 'self'`: keeps static pages and is strict, but the docs note it can't cover dynamically generated scripts, and App Router streams inline data scripts.

**Decision (owner: "use the best one").** Use **3 if a real production build proves it works**: a Playwright test loads every template with the CSP and fails on any `securitypolicyviolation`. Otherwise use **2**, with every other directive strict (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors` limited to the Sanity Studio origin for Presentation). SRI stays on either way, so external chunks are integrity-checked. Report-Only first, then enforce (Phase 7). The verified outcome is recorded below when known.

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
