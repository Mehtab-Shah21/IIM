# IIM Technical Services: Claude Code Master Prompt

> **How to use this file.** Save it in the repository root as `CLAUDE.md` (Claude Code reads it automatically), or paste it as your first message. Then send: *"Read CLAUDE.md fully. Start Phase 0."*
> Work happens in phases. Claude Code must stop at every **CHECKPOINT** and report before continuing.

---

## 1. Mission

Rebuild **iimtechnicalservices.com** (IIM Technical Services, a Dubai home and commercial maintenance company) as a premium, very fast, secure, SEO-ready website. It replaces a Wix site that has copy errors, mislabelled service URLs, a mismatched phone number, no real quote form and no lead tracking.

**Stack (decided, do not change without asking):** Next.js (App Router, TypeScript strict) + Tailwind CSS locked to design tokens + Sanity CMS (free plan, hosted Studio) + Hostinger Node.js hosting (deployed from GitHub) + Cloudflare (DNS, WAF, Turnstile) + Make or n8n for automation + Google Sheets as the lead tracker.

**Who edits the site later:** a non-developer **SEO specialist** who changes titles, descriptions, schema, redirects and content often. He must be able to do all of that in Sanity Studio without a developer and without breaking layout.

**What success looks like**
- A first-time visitor understands who IIM is, what they do and how to book within 3 seconds, and wants to keep scrolling.
- Mobile Lighthouse performance 90 or higher on every template. LCP under 2.5 s, INP under 200 ms, CLS under 0.1.
- Every box, width and corner follows the design tokens. Nothing looks "almost right".
- Quote requests reach the owner within a minute and are never lost.
- The SEO specialist can change a title, description, schema option, redirect and page content live, with no deploy.

**Traffic expectation:** about 100 visitors a day, 1,000 a month. Free tiers are enough. Do not over-engineer.

---

## 2. Operating rules for Claude Code

1. **Never invent business facts.** No fake license numbers, certifications, years in business, job counts, prices, reviews, team names, addresses or photos. Use a clearly marked placeholder and log it in `PLACEHOLDERS.md` (see section 20). Facts that need the client are tagged **[CONFIRM]**.
2. **Do not rely on memory for library APIs.** Versions change. Check the installed package versions and read their docs or type definitions before using an API (Next.js, Tailwind, `next-sanity`, Sanity Studio, Zod, Playwright, Lighthouse CI). Use the latest stable versions: run `npm view <pkg> version` and pin with a lockfile.
3. **Work in the phases in section 19.** At each CHECKPOINT: run all checks, summarise what was built, list open questions and placeholders, then stop and wait.
4. **Small, reviewable commits** on feature branches, merged to `main` only when CI passes. Conventional commit messages. Keep `main` deployable.
5. **Ask before** changing the stack, adding a dependency that is not in section 4, adding a paid service, or deviating from a number in this file.
6. **You cannot access the client's accounts.** For anything that needs a login (Sanity project, Cloudflare, Hostinger hPanel, Make, Google, DNS) write a precise step-by-step in `docs/MANUAL_TASKS.md` and carry on with mocks or environment variables.
7. **No secrets in the repository or the client bundle.** Only `NEXT_PUBLIC_*` values that are genuinely public may reach the browser.
8. **Original content only.** No lorem ipsum in anything that ships. No text duplicated between pages. The old site reused electrical copy in the Plumbing section; that must never recur.
9. **Quality bar:** write the code a senior engineer would be proud to hand over. Typed, linted, tested, documented, accessible.
10. **When unsure about layout or visual quality, look at it.** Run the dev server, take Playwright screenshots at the widths in section 17 and inspect them before declaring a UI task done.

---

## 3. Business facts and content rules

### Known facts (from the current site)
- Brand: **IIM Technical Services**, Dubai, UAE. Canonical host today: `https://www.iimtechnicalservices.com` (keep **www** as canonical to preserve existing authority; redirect the apex to www).
- Services: Electrical, Plumbing, Painting, Handyman, Home Makeovers (renovation), 24/7 Emergency, Annual Maintenance Contracts (Residential and Commercial).
- Promises on the current site: instant service in Dubai, 3-step booking, **pay after service**, DEWA-compliant technicians [CONFIRM proof before keeping this claim].
- WhatsApp number used by the current links: **+971 50 962 6446**. The current footer *displays* +971 50 904 4115 but links to +971 50 962 6446. **[CONFIRM the correct number]**. Until confirmed, read every contact detail from the `siteSettings` document, never hard-code it.

### [CONFIRM] register (ask the user, do not guess)
Logo files and brand colours, correct phone numbers, trade licence number, DEWA proof, insurance, real photos and videos, real social URLs (the old footer points to Wix pages), Google Business Profile link, final service list (is AC offered?), service areas, working hours, whether quotes and inspections are free, whether price ranges may be published, testimonial permissions and names, warranty terms, response-time promises, domain/DNS access, data-retention period, whether to allow AI training crawlers in `robots.txt`, whether photo uploads use external storage.

### Writing rules
- British English. Friendly, professional, concise. Short paragraphs. No keyword stuffing and no unprovable superlatives ("best in Dubai").
- Every service, area and guide page opens with a **40 to 60 word direct answer**, then detail, then FAQ in real question-and-answer form.
- Write for Dubai conditions: villas and apartments, DEWA, summer heat and AC load, older buildings, community and building management rules.
- Keep name, address and phone identical everywhere.

---

## 4. Technology decisions

| Area | Decision |
|---|---|
| Framework | Next.js (latest stable), App Router, React Server Components, TypeScript `strict`. **No `output: 'export'`**: we need route handlers, ISR and on-demand revalidation. |
| Runtime | Node.js LTS. Pin in `package.json` `engines` and `.nvmrc`. |
| Styling | Tailwind CSS (v4 CSS-first config) restricted to the tokens in section 7. Reset the default palette and spacing so only tokens exist. Lint rule or CI grep to block arbitrary values like `w-[437px]`. |
| CMS | Sanity (free plan). **Hosted Studio** via `sanity deploy` in a separate `/sanity` package, not embedded in the Next.js app (keeps the app small). |
| Data fetching | `next-sanity` with GROQ, `useCdn: true` for public reads, cache tags per document type, on-demand revalidation. |
| Validation | Zod. |
| Forms backend | Next.js route handlers. Turnstile, honeypot, minimum-time check, rate limiting. |
| Email | `nodemailer` over SMTP (works with Hostinger mailbox or any SMTP). Put it behind a `sendEmail()` adapter so Resend can replace it. |
| Automation | Make or n8n via a signed webhook. Google Sheets as the lead tracker. |
| Images | CMS images use a **custom `next/image` loader pointing at Sanity's image CDN** (width, format and quality parameters) so Hostinger's CPU does no image resizing. Local static images are pre-optimised in the repo. |
| Fonts | `next/font/google` (self-hosted at build): Plus Jakarta Sans (headings), Inter (body). Latin subset. |
| Icons | One inline SVG set (Lucide icons copied in as components, tree-shaken). No icon fonts. |
| Animation | CSS only (transitions and `@keyframes`). No animation library. `prefers-reduced-motion` respected. |
| Tests | Vitest (unit), Playwright (e2e and screenshots), `@axe-core/playwright`, Lighthouse CI. |
| Quality | ESLint, Prettier, TypeScript, `lint-staged`, Husky or simple-git-hooks. |
| CI | GitHub Actions: install, lint, typecheck, unit tests, build, Playwright, Lighthouse CI. |
| Dependencies | Keep the list short. Dependabot or Renovate enabled. |

**Allowed dependencies (initial):** `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `next-sanity`, `@sanity/image-url`, `sanity` (in `/sanity`), `zod`, `nodemailer`, `clsx`. Dev: `typescript`, `eslint`, `prettier`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, `sharp` (only if needed for local asset scripts). Anything else: ask first.

**Middleware note:** newer Next.js versions may rename `middleware` to another file convention. Check the installed version's docs and use the correct one.

---

## 5. Repository structure

```
/
├─ CLAUDE.md                      (this file)
├─ README.md
├─ PLACEHOLDERS.md                (every placeholder and [CONFIRM] item)
├─ docs/
│  ├─ PLAN.md                     (Phase 0 output)
│  ├─ MANUAL_TASKS.md             (things only a human can do)
│  ├─ RUNBOOK.md                  (deploy, rollback, backups, incident checklist)
│  ├─ SEO_GUIDE.md                (for the SEO specialist)
│  ├─ DESIGN_SYSTEM.md
│  └─ DECISIONS.md                (short ADR log)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx, page.tsx, not-found.tsx, sitemap.ts, robots.ts
│  │  ├─ services/ (page.tsx, [slug]/page.tsx)
│  │  ├─ areas/ (page.tsx, [slug]/page.tsx)
│  │  ├─ annual-maintenance-contract/ (page.tsx, residential/, commercial/)
│  │  ├─ about/, projects/, reviews/, faq/, contact/, get-a-quote/
│  │  ├─ guides/ (page.tsx, [slug]/page.tsx)
│  │  ├─ thank-you/, privacy-policy/, terms/, accessibility/
│  │  ├─ style-guide/            (noindex, shows every component state)
│  │  └─ api/ quote/route.ts, revalidate/route.ts
│  ├─ components/ layout/ ui/ sections/ seo/ forms/
│  ├─ lib/ sanity/ seo/ forms/ mail/ security/ analytics/
│  ├─ styles/ tokens.css, globals.css
│  └─ types/
├─ sanity/                        (Studio package: schemas, structure, seed)
├─ tests/ unit/ e2e/ visual/
├─ public/ (favicons, static images, og defaults)
├─ .env.example
└─ .github/workflows/ci.yml
```

---

## 6. Environment variables (`.env.example`)

```
# Site
NEXT_PUBLIC_SITE_URL=https://www.iimtechnicalservices.com

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01   # use a current date-based version
SANITY_REVALIDATE_SECRET=                    # shared with the Sanity publish webhook

# Lead delivery (Make or n8n)
LEAD_WEBHOOK_URL=
LEAD_WEBHOOK_SECRET=                         # HMAC signing key

# Spam protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Email
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM="IIM Technical Services <no-reply@iimtechnicalservices.com>"
OWNER_EMAIL=

# Feature flags
ENABLE_UPLOADS=false                         # photo uploads stay off until storage is approved

# Analytics (optional, loaded lazily)
NEXT_PUBLIC_GA_ID=
```

Validate all variables at startup with Zod (`src/lib/env.ts`). Fail the build with a readable error if a required one is missing in production.

---

## 7. Design system (non-negotiable)

Every box, width and corner must come from these tokens. **No arbitrary values anywhere.**

### Tokens (`src/styles/tokens.css`)
```css
:root {
  /* spacing: 8px grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 128px;

  /* radii */
  --radius-sm: 8px;      /* buttons, inputs, badges */
  --radius-md: 12px;     /* cards, form panels */
  --radius-lg: 20px;     /* hero media, CTA bands, large images */
  --radius-pill: 999px;  /* chips, floating buttons */

  /* layout */
  --container: 1200px;
  --container-wide: 1320px;
  --prose: 68ch;
  --gutter: 16px;
  --header-h: 64px;
  --action-bar-h: 64px;

  /* colour: CONFIRMED by the owner on 9 Oct 2026: match the live site's theme
     (charcoal/black + gold/amber, cream text on dark, navy text on light).
     Sampled from www.iimtechnicalservices.com; see docs/DECISIONS.md ADR-002. */
  --ink-950: #0f0f0f;         /* footer, deepest surfaces */
  --ink-900: #1a1a1a;         /* header, dark sections, text on amber/gold */
  --ink-800: #262626;         /* raised cards on dark */
  --ink-700: #3a3a3a;         /* borders on dark */
  --gold: #e6b215;            /* brand gold: bands, large panels (ink text on it) */
  --accent: #ffb800;          /* primary CTAs and highlights, with ink-900 text on it */
  --accent-600: #e6a600;      /* accent hover */
  --cream: #f5f0de;           /* body text on dark; warm light surface */
  --cream-muted: #c9c3ad;     /* secondary text on dark */
  --navy: #002366;            /* headings and links on white/cream surfaces */
  --white: #ffffff;
  --neutral-50: #f7f7f5;
  --neutral-100: #efeee9;
  --neutral-200: #dedcd4;     /* the one border colour on light surfaces */
  --neutral-600: #5c6370;     /* muted text on white */
  --success: #1e7e46;
  --error: #c0392b;
  --whatsapp: #25d366;        /* WhatsApp buttons only, with ink-900 text */

  /* shadows: three levels only */
  --shadow-sm: 0 1px 2px rgb(15 15 15 / 0.08);
  --shadow-md: 0 6px 16px rgb(15 15 15 / 0.12);
  --shadow-lg: 0 16px 40px rgb(15 15 15 / 0.18);

  /* motion */
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-fast: 150ms; --dur: 250ms; --dur-slow: 400ms;
}
@media (min-width: 768px)  { :root { --gutter: 24px; --header-h: 72px; } }
@media (min-width: 1280px) { :root { --gutter: 32px; } }
```
Map these into Tailwind's `@theme`. Disable Tailwind's default colour, spacing and radius scales (`--color-*: initial;` and similar) so only tokens exist. Verify every text and background pair meets **WCAG 2.2 AA** contrast with a script in CI. Ink (`--ink-900`) text on amber and gold; never white on amber or gold, and never amber or gold as text on white or cream. Amber/gold text is allowed only on ink surfaces.

### Layout rules
- Container: max 1200 px (1320 px for full-bleed hero sections), side gutters from `--gutter`. Reading text capped at 68 characters.
- 12-column grid; gap 16 px mobile, 24 px from 768 px.
- Section vertical padding: 64 px mobile, 96 px from 1024 px, identical across all sections.
- Breakpoints: design baseline 360; also 480, 768, 1024, 1280, 1440. Must hold at 320 and 1920.
- No horizontal scroll at any width. No clipped or overflowing text.

### Corner rules
- Buttons, inputs, badges: `--radius-sm`. Cards and form panels: `--radius-md`. Hero media, large images, CTA bands: `--radius-lg`. Chips and floating buttons: `--radius-pill`.
- **Nested radius rule:** an inner element's radius = outer radius minus the padding between them. Images inside cards are clipped with `overflow: hidden` at the card radius so corners always align.
- One border style (1 px `--neutral-200` on light surfaces, `--ink-700` on dark). Three shadow levels only.

### Typography
- Headings: Plus Jakarta Sans. Body: Inter. Fluid scale with `clamp()`: H1 about 32 to 56 px, H2 about 26 to 40 px, H3 about 20 to 26 px, body 16 to 18 px. Heading line-height 1.15, body 1.6. `font-display: swap` with a size-adjusted fallback (no layout shift).

### Components (spec)
- **Button:** min-height 48 px, horizontal padding 24 px, radius 8 px, weight 600, visible focus ring (3 px, 2 px offset). Variants: primary (amber, ink text), secondary (outline: ink on light surfaces, cream on dark), whatsapp (green, ink text), ghost. States: hover, active, focus-visible, disabled, loading.
- **Card:** padding 20 px mobile, 24 px desktop, equal heights per row (CSS grid stretch), media at a fixed `aspect-ratio: 16 / 10`, consistent title and text spacing, CTA pinned to the bottom.
- **Input:** 48 px height, 8 px radius, visible label always, error text linked with `aria-describedby`, 16 px font minimum (prevents iOS zoom).
- **Badge and chip:** pill or 8 px radius per section 7.
- **Section header:** eyebrow, H2, optional lead paragraph, consistent spacing.
- Build a `/style-guide` page (noindex) showing every component and state. Use it for visual regression tests.

### Motion
Fade-and-rise on scroll (200 to 400 ms), hover lift on cards, animated number counters. All disabled under `prefers-reduced-motion`. No animation may cause layout shift.

---

## 8. Global layout components

- **Header:** height `--header-h`, sticky, fixed height so it never shifts. Logo left; nav (Home, Services with a mega menu, Annual Contract, About, Projects, Contact); Call button and **Get a Quote** button. Mobile: accessible slide-in drawer, large tap targets, focus trap, Escape closes.
- **Mobile action bar:** 64 px, fixed bottom, three equal buttons (Call, WhatsApp, Get a Quote), respects iOS safe area (`env(safe-area-inset-bottom)`). `body` gets matching bottom padding on mobile so content is never hidden.
- **Floating WhatsApp button:** desktop only (the action bar covers mobile). Each page uses its own prefilled message, for example *Hi IIM, I need an electrician in Dubai.* Build links with `https://wa.me/<number>?text=<encoded>`.
- **Footer:** logo, short description, services, areas, contact details, licence number, social links (render only URLs that exist), legal links, current-year copyright.
- **Breadcrumbs** on inner pages, matching BreadcrumbList schema.
- Skip-to-content link, landmarks (`header`, `nav`, `main`, `footer`).

---

## 9. Sanity content model

Build schemas in `/sanity/schemaTypes`. Generate TypeScript types from the schema (`sanity typegen`) and use them in the app. No `any`.

**Document types:** `siteSettings` (singleton), `service`, `area`, `project`, `testimonial`, `faq`, `guide`, `page` (about, contact, legal and similar), `redirect`.

**Shared `seo` object** (on every page-level type):
```ts
seo: {
  metaTitle: string        // warn outside 50-60 chars
  metaDescription: string  // warn outside 140-155 chars
  canonicalOverride?: url
  noindex: boolean
  ogImage?: image          // 1200x630
  extraJsonLd?: text       // validated as JSON, merged into the page graph
}
```
**Page-level fields:** hero headline and subhead, `directAnswer` (40 to 60 words, validated), body as an array of a **fixed set of section blocks** (richText, imageText, steps, proofPoints, gallery, ctaBand, faqList, relatedServices), related services, CTA settings, author or reviewer reference, `lastReviewed` date.

**`siteSettings`:** business name, phone, WhatsApp number, email, address, opening hours, licence number, DEWA proof text, social URLs, service areas list, default WhatsApp message, Google review link, Google Business Profile link, default OG image, analytics IDs.

**`redirect`:** `from` (path, validated: starts with `/`, no spaces), `to` (path or URL), `type` (301 or 302), `note`.

**Studio UX:** live character counters on title and description, a search-result preview, singleton handling for `siteSettings`, sensible desk structure (Pages, Services, Areas, Guides, Projects, Reviews, FAQs, Redirects, Settings), drafts and history on. Free plan allows 2 permission roles: plan for **Administrator (developer)** and **Editor (SEO specialist)**. The owner may share the Editor role.

**Seed data:** write `sanity/seed/` with original starter content for every service and the homepage (placeholders clearly marked), importable with the Sanity CLI so the site is fully populated on first run.

**Data rules:** the dataset is **public** on the free plan. Never store private data, leads or secrets in Sanity.

---

## 10. Pages, URLs and homepage

Clean, lowercase, hyphenated URLs. **No `copy-of-` slugs anywhere.**

```
/                                   Home
/services/                          Hub
/services/electrical-services-dubai/
/services/plumbing-services-dubai/
/services/painting-services-dubai/
/services/handyman-services-dubai/
/services/home-renovation-dubai/
/services/emergency-electrician-plumber-dubai/
/annual-maintenance-contract/       (+ /residential/ and /commercial/)
/areas/                             Hub, plus /areas/{area}/ for real areas [CONFIRM]
/about/  /projects/  /reviews/  /faq/  /contact/  /get-a-quote/
/guides/                            Hub, plus /guides/{slug}/
/thank-you/ (noindex)  /privacy-policy/  /terms/  /accessibility/  custom 404
```
Apex domain redirects to `https://www.iimtechnicalservices.com`.

### Homepage flow (in this order)
1. **Hero:** LCP image (no autoplay video by default; poster-only), H1 with service and city, one-line promise, two buttons (**Get a Quote**, **WhatsApp Us**), trust strip (24/7 emergency, DEWA-compliant [CONFIRM], pay after service, Google rating if real).
2. **Services grid:** cards for Electrical, Plumbing, Painting, Handyman, Home Makeovers, Emergency. Equal heights.
3. **How it works:** 3 steps with icons (message us; share the issue with a photo or video; send location and date, pay after service).
4. **Why IIM:** four proof points with icons.
5. **Numbers:** animated counters [CONFIRM actual figures, otherwise hide the section].
6. **Before and after gallery** of real work [placeholder frames until photos arrive].
7. **Annual maintenance highlight** with the short application form.
8. **Testimonials** with names and a Google review link (only real, approved ones).
9. **FAQ:** 6 to 8 real questions.
10. **Final CTA band**, then footer.

Each service page: hero, direct answer, what's included, process, areas served, FAQ, related services, quote CTA. Area pages need genuinely local content, not templated filler.

---

## 11. SEO, AEO and GEO implementation

### Metadata
- A single `buildMetadata()` helper used by every route's `generateMetadata`. Titles come from the CMS and are used as `title.absolute` (no automatic suffix). Include canonical (always absolute, always `https://www...`), Open Graph, Twitter card, robots (noindex from the CMS toggle).
- Fallback templates for services, areas, projects and guides when a field is empty.
- Open Graph images: per-page image from the CMS, else the default; generate branded ones with `opengraph-image` if useful.

### Draft titles and descriptions (SEO specialist will refine; titles at most 60 characters, descriptions at most 155)
- **Home:** *IIM Technical Services | Electrician & Plumber in Dubai* / Licensed electrical, plumbing, painting and handyman services across Dubai. 24/7 emergency help. Book in 3 steps and pay after the service.
- **Services hub:** *Home Maintenance & Repair Services in Dubai | IIM* / Electrical, plumbing, painting, handyman and renovation services for Dubai homes and businesses. Fast booking, pay after service.
- **Electrical:** *Electrician in Dubai | 24/7 Electrical Services | IIM* / DEWA-compliant electricians for repairs, rewiring, lighting and installations in Dubai. Fast response, clear pricing, pay after service.
- **Plumbing:** *Plumber in Dubai | Leak & Pipe Repair Services | IIM* / Reliable plumbers in Dubai for leaks, blocked drains, water heaters and fittings. Same-day visits where available. Pay after the service.
- **Painting:** *Painting Services in Dubai | Interior & Exterior | IIM* / Interior and exterior painting for villas, apartments and offices in Dubai. Clean finish, tidy crews, transparent quotes.
- **Handyman:** *Handyman Services in Dubai | Home Repairs | IIM* / Fixtures, assembly, minor repairs and general maintenance for Dubai homes and offices. Book a trusted handyman today.
- **Renovation:** *Home Renovation & Makeovers in Dubai | IIM* / Kitchen, bathroom and flooring upgrades for Dubai homes with skilled craftsmen. Request a quote.
- **Emergency:** *24/7 Emergency Electrician & Plumber Dubai | IIM* / Power outage, burst pipe or electrical fault? Call or WhatsApp IIM for urgent help across Dubai.
- **Annual contract hub:** *Annual Maintenance Contract Dubai | Home & Business | IIM* / Protect your property with an annual package covering electrical, plumbing and general repairs. Residential and commercial plans.
- **Residential AMC:** *Residential Maintenance Contract Dubai | IIM*. **Commercial AMC:** *Commercial Maintenance Contract Dubai | IIM*.
- **About:** *About IIM Technical Services | Dubai Maintenance Team*. **Projects:** *Our Work | Completed Projects in Dubai | IIM*. **Reviews:** *Customer Reviews | IIM Technical Services Dubai*. **FAQ:** *FAQs | Maintenance & Repair Services in Dubai | IIM*. **Contact:** *Contact IIM Technical Services | Call or WhatsApp*. **Get a Quote:** *Get a Quote | IIM Technical Services Dubai*. **Areas hub:** *Areas We Serve in Dubai | IIM Technical Services*. **Area template:** *Electrician & Plumber in {Area}, Dubai | IIM*. **Guides hub:** *Home Maintenance Guides for Dubai Homes | IIM*.
- Thank-you, internal search and 404: `noindex`.
- Do **not** claim "free" quotes, response times or warranties until confirmed.

### Structured data (single source of truth, no duplicates)
One JSON-LD builder per page type produces the whole `@graph` from CMS fields, server-rendered in the initial HTML:
- Organization, WebSite, WebPage, BreadcrumbList on every page.
- `LocalBusiness` using `HomeAndConstructionBusiness` with `Electrician` and `Plumber` where accurate: name, URL, telephone, address, `areaServed`, `openingHoursSpecification` [CONFIRM 24/7], `sameAs`, logo, image, `hasOfferCatalog`.
- `Service` on service pages with `areaServed` and provider.
- `Article` on guides (author, `datePublished`, `dateModified` from `lastReviewed`).
- `FAQPage` where FAQs exist (kept for machine readability; do not promise Google FAQ rich results).
- `AggregateRating` **only** if real reviews exist and are visible on the page.
- The editor-supplied `extraJsonLd` is validated and merged.
- Add a test that validates JSON-LD parses and has required properties.

### Crawling and indexing
- `app/sitemap.ts`: all indexable pages with `lastModified` from the CMS; excludes noindex pages. `app/robots.ts`: allow normal crawling; disallow `/api/`, `/style-guide/`, `/thank-you/` and internal search; reference the sitemap.
- AI crawlers: allow search and answer bots (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, ClaudeBot). Training-bot policy (GPTBot, Google-Extended and similar) is a client decision **[CONFIRM]**; make it a one-line config switch.
- `llms.txt` is optional and low priority; skip unless asked.
- Self-referencing canonical on every page, one H1 per page, logical heading order, descriptive internal links, noindex on thin archives.

### Redirects
- The `redirect` documents in Sanity apply at runtime through middleware using a cached lookup (revalidate about every 5 minutes, plus on-demand via tag when a redirect is published). 301 for permanent. Guard against loops and chains (log and ignore if detected).
- Seed these old Wix URLs (**verify what each actually contained before final mapping**, because the old menu labels and slugs did not match):
  `/copy-of-ac-services`, `/copy-of-electrical-services`, `/copy-of-plumbing-services`, `/copy-of-painting-services`, `/copy-of-handyman-services` → matching new service pages; `/lead-collection` → `/annual-maintenance-contract/residential/`; `/registration` → `/annual-maintenance-contract/commercial/`; `/about-us` → `/about/`; `/accessibility-statement` → `/accessibility/`.
- Never redirect many unrelated URLs to the home page.

### AEO and GEO content structure
Answer-first blocks, FAQ sections that mirror conversational queries, consistent NAP, `sameAs` links, last-reviewed dates, named author or reviewer on guides, original photos with descriptive alt text. Add a **guides** section the SEO specialist can grow, each guide linking to the relevant service.

---

## 12. Quote and contract forms

### Behaviour
- **Three-step form** (also works as one plain HTML form without JavaScript: progressive enhancement). Steps: (1) service and issue description; (2) emirate, area, preferred date and time; (3) name, phone, optional email, consent checkbox.
- **AMC application** is a shorter variant: full name, phone, emirate, location, property type, consent.
- Inline, accessible validation. 48 px fields. Labels always visible. Clear success and failure states. Buttons show a loading state and prevent double submit.
- Photo upload is **behind `ENABLE_UPLOADS` (default false)**. When off, the thank-you page shows a "Send photos on WhatsApp" button prefilled with the reference number.

### Validation (shared Zod schema used on client and server)
- `service`: enum of service slugs. `description`: 10 to 1000 chars. `emirate`: enum of the seven emirates. `area`: 2 to 80 chars. `address`: optional, up to 200. `preferredDate`: ISO date, today to +60 days. `preferredTime`: `asap | morning | afternoon | evening`. `name`: 2 to 80. `phone`: UAE number (mobile `05x xxx xxxx` or landline), accept `+971`, `00971` and leading `0`, **normalise to E.164**. `email`: optional, valid. `consent`: must be true.
- Honeypot field `website` (must be empty). `startedAt` timestamp (reject if submitted in under 3 seconds). Turnstile token required.

### `POST /api/quote`
1. Check `Origin` matches the site. Enforce content type and a request size limit (for example 32 KB without uploads).
2. Rate limit: 5 requests per hour per IP, in-memory on the app as a backstop **and** a Cloudflare rate-limiting rule as the primary defence (document the rule in `docs/MANUAL_TASKS.md`).
3. Verify the Turnstile token server-side. Run honeypot and time checks. Validate with Zod. Sanitise strings.
4. Generate a reference `IIM-YYMMDD-XXXX` (random base32, collision-safe).
5. Build the lead payload and **send to the Make or n8n webhook** with headers `X-IIM-Timestamp` and `X-IIM-Signature: sha256=<HMAC of timestamp + "." + raw body with LEAD_WEBHOOK_SECRET>`. Retry up to 3 times with backoff.
6. **Always email the owner the full lead details** as the safety net, even if the webhook succeeded. If the webhook failed after retries, mark the owner email subject with `[WEBHOOK FAILED]`.
7. Send the customer a confirmation email (only if an email was given) with the reference, a summary and the WhatsApp link.
8. Respond `200 { ok: true, ref }`. JS clients navigate to `/thank-you?ref=...`; no-JS clients get a `303` redirect. Errors: `400` with field errors, `429` rate limited, `503` if neither the webhook nor email could be delivered (never silently drop a lead).
9. Log structured events without personal data in the logs (log the reference, not the phone number).

### Webhook payload (JSON)
```json
{
  "ref": "IIM-261009-K7QX",
  "type": "quote",
  "createdAt": "2026-10-09T10:15:30.000Z",
  "service": "plumbing",
  "description": "...",
  "emirate": "Dubai",
  "area": "Dubai Marina",
  "address": "",
  "preferredDate": "2026-10-11",
  "preferredTime": "morning",
  "name": "...",
  "phone": "+9715XXXXXXXX",
  "email": "",
  "pageUrl": "https://www.iimtechnicalservices.com/services/plumbing-services-dubai/",
  "utm": { "source": "", "medium": "", "campaign": "" }
}
```

### Google Sheet columns (document in `docs/MANUAL_TASKS.md`)
`ref, created_at, type, status (New/Contacted/Quoted/Booked/Done/Lost), name, phone, email, service, emirate, area, address, preferred_date, preferred_time, description, source_page, utm_source, utm_medium, utm_campaign, contract_start, renewal_date, reminded_30, reminded_7, owner_notes`

### Make or n8n scenarios (Claude Code writes the spec; a human builds them)
- **Scenario 1 (leads):** webhook → verify signature → append Sheet row → alert the owner. WhatsApp alerts need a WhatsApp sender (Business API provider, Twilio or similar), which is a separate manual setup; document a free fallback (email plus Telegram bot). One scenario with a router handles both quote and AMC types (Make's free plan allows 2 active scenarios).
- **Scenario 2 (reminders):** daily at 09:00 Asia/Dubai → find AMC rows with `status` active and `renewal_date` 30 or 7 days away and the matching `reminded_*` flag empty → notify the owner (and optionally the customer by email) → set the flag.

### Thank-you page
Reference number, what happens next, expected response time [CONFIRM], WhatsApp button with the reference prefilled, link back to services. `noindex`.

---

## 13. Performance rules and budgets

- **Targets (mobile):** Lighthouse performance 90 or higher on every template; LCP under 2.5 s; INP under 200 ms; CLS under 0.1.
- **Budgets:** home page under 800 KB transferred; total CSS under 40 KB; first-load JavaScript under 100 KB gzipped on every page. CI fails if exceeded.
- **Rendering:** static generation with ISR; on-demand revalidation by tag when Sanity publishes; server components by default; client components only with a stated reason (mobile menu, form, lightbox, counters); dynamic import for the lightbox and form steps beyond the first.
- **Images:** AVIF and WebP via the Sanity CDN loader, correct `sizes`, explicit width and height on every image, `priority` on the LCP image only, everything else lazy, meaningful `alt`. Hero image preloaded.
- **Fonts:** `next/font`, Latin subset, size-adjusted fallbacks, no third-party font requests.
- **Third-party scripts:** analytics and Turnstile load lazily (after idle or on form focus). No tag manager unless needed.
- **Caching:** long cache for static assets; never cache `/api`. Document the Cloudflare cache rules in `docs/MANUAL_TASKS.md`.
- Remove what is not needed. Run a bundle analysis and keep the report in CI.

---

## 14. Security

- HTTPS everywhere, HSTS (after verification), apex to www redirect.
- Headers set in `next.config` `headers()`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera, microphone, geolocation and others), `frame-ancestors` restriction, `Cross-Origin-Opener-Policy: same-origin`.
- **CSP trade-off (flag this to the user):** a nonce-based CSP forces every page to render dynamically, which defeats static generation and ISR. Default plan: a **static CSP** (no nonces) allowing `'self'`, the Sanity CDN, Cloudflare Turnstile (`challenges.cloudflare.com`) and the analytics host; start in **Report-Only**, then enforce once clean. Evaluate hash-based or SRI options only if the installed Next.js supports them without losing static rendering. Record the decision in `docs/DECISIONS.md`.
- No database, admin panel or login on the public site. Route handlers check origin, content type and size. Secrets only in environment variables, never in `NEXT_PUBLIC_*`. Webhooks signed. Turnstile, honeypot and rate limiting on forms.
- Supply chain: lockfile committed, Dependabot or Renovate, `npm audit` in CI, pinned Node LTS, prompt Next.js security updates.
- Sanity: read-only public queries; any API token scoped minimally and server-side only; CORS limited to the site and Studio domains.
- Accounts (human tasks): 2FA on GitHub, Hostinger, Cloudflare, Sanity, Make and Google; no shared logins.
- Privacy: consent checkbox on forms, a real privacy policy (retention period [CONFIRM], deletion on request), aligned with UAE data protection requirements. Do not log personal data.

---

## 15. Accessibility

WCAG 2.2 AA: semantic landmarks, skip link, keyboard-operable menus and drawers, visible focus, tap targets at least 44 px (aim for 48), form labels and error association, descriptive alt text (empty alt for decoration), no colour-only meaning, `prefers-reduced-motion` support, sensible heading order, `lang="en"`. Add an **Accessibility statement** page. Run axe in Playwright on every template and fail CI on serious violations.

---

## 16. Analytics

GA4 and Search Console (IDs from environment, optional). Lazy-loaded. Wrap in a tiny `track(event, params)` utility. Events: `quote_submit`, `amc_submit`, `whatsapp_click`, `phone_click`, `cta_click`. Add a cookie or consent notice only if the client confirms it is needed **[CONFIRM]**.

---

## 17. Testing and CI

- **Unit (Vitest):** Zod schemas (phone normalisation especially), HMAC signing and verification, metadata builder, JSON-LD builders, redirect matcher (loops and chains), reference generator.
- **E2E (Playwright):** full quote flow with a mocked webhook and mail transport (valid, invalid, honeypot, too-fast submit, rate limit, webhook failure, no-JavaScript), AMC form, navigation, mobile drawer, action bar, WhatsApp links.
- **Layout and visual:** screenshots of every template at **320, 360, 390, 768, 1024, 1280, 1440 and 1920 px**. Assert `document.documentElement.scrollWidth <= window.innerWidth` at every width. Add checks that card heights in a row are equal and that no element overflows its container.
- **Accessibility:** `@axe-core/playwright` on every template.
- **Lighthouse CI:** mobile profile with the targets and budgets above.
- **SEO checks:** every indexable page has a unique title (50 to 60 chars) and description (140 to 155 chars), exactly one H1, a canonical, and valid JSON-LD; sitemap and robots are well-formed; no broken internal links; redirect map resolves with no chains or loops.
- **CI workflow:** install, lint, typecheck, unit, build, Playwright, Lighthouse CI. A failure blocks merge.

---

## 18. Deployment on Hostinger

- The client already has a **Hostinger Node.js plan**. Deploy from a private GitHub repository connected in hPanel. Hostinger runs the build and serves the app; set environment variables in hPanel; pin the Node LTS version. Check the plan's memory and build limits first and report them in `docs/PLAN.md`.
- Environments: a password-protected, noindex **staging** deployment (for example `staging.iimtechnicalservices.com`) for client approval; production only after written sign-off.
- Do not write persistent data to the app's disk (deployments may replace it). Leads go to the webhook and email, not the filesystem.
- DNS through Cloudflare. Do **not** switch DNS until launch day; lower the TTL the day before. Verify the www canonical, apex redirect and redirect map after the switch.
- Set up SPF, DKIM and DMARC for the sending domain.
- Rollback: redeploy the previous commit. Document it in `docs/RUNBOOK.md`.
- Backups: code in GitHub; weekly Sanity dataset export to off-site storage (`sanity dataset export`); Google Sheet version history.
- Post-launch: watch Search Console for crawl errors and 404s for four weeks.

---

## 19. Phased plan with checkpoints

### Phase 0: Discovery and plan
Read this file in full. Inspect the repo, Node and npm versions. Check current versions of the allowed dependencies. Produce `docs/PLAN.md` (architecture, risks, estimates, Hostinger limits to verify), `PLACEHOLDERS.md` and `docs/MANUAL_TASKS.md` (initial). List every question you need answered. **CHECKPOINT: stop and report.**

### Phase 1: Foundation
Initialise Next.js (TypeScript strict), Tailwind with tokens only, fonts, ESLint, Prettier, hooks, Vitest, Playwright, Lighthouse CI, GitHub Actions, env validation, folder structure, base layout, header, footer, mobile action bar, buttons, cards, inputs, `/style-guide`. **Acceptance:** CI green; style guide renders correctly at all widths; tokens enforced. **CHECKPOINT.**

### Phase 2: Sanity
Schemas, Studio structure, validation and previews, seed content, GROQ queries with tags, typegen, `/api/revalidate` with webhook signature verification, custom image loader. **Acceptance:** an edit published in Studio appears on the live page within a minute without a deploy (test with a mock if no project yet). **CHECKPOINT.**

### Phase 3: Homepage
Build every homepage section to the spec. Real design effort here: this is the first impression. **Acceptance:** looks premium at all widths; Lighthouse 90 or higher on mobile; no layout shift. **CHECKPOINT with screenshots.**

### Phase 4: Inner pages
Services hub and template, area template, AMC pages, about, projects, reviews, faq, contact, guides, legal pages, 404. **Acceptance:** every page populated from seed data, consistent spacing and corners, breadcrumbs working. **CHECKPOINT.**

### Phase 5: Forms and lead pipeline
Quote and AMC forms, API route, validation, Turnstile, rate limiting, webhook client with HMAC, emails, thank-you page, WhatsApp links, analytics events. Write the Make or n8n scenario spec. **Acceptance:** the full e2e suite passes including failure cases. **CHECKPOINT.**

### Phase 6: SEO layer
Metadata builder, JSON-LD builders, sitemap, robots, redirects middleware, Open Graph images, SEO guide for the specialist. **Acceptance:** SEO checks in CI pass; schema validates. **CHECKPOINT.**

### Phase 7: Hardening
Performance pass against budgets, accessibility pass, security headers (CSP in Report-Only), dependency audit. **Acceptance:** all budgets and axe checks pass. **CHECKPOINT.**

### Phase 8: QA, docs and handover
Full QA run, `README.md`, `docs/RUNBOOK.md`, `docs/SEO_GUIDE.md`, `docs/DESIGN_SYSTEM.md`, final `PLACEHOLDERS.md`, launch checklist. **Acceptance:** the definition of done below. **CHECKPOINT: ready for client review.**

---

## 20. Placeholder register (`PLACEHOLDERS.md`)

For every placeholder or [CONFIRM] item record: where it appears (file or Sanity document), what is needed, who supplies it, and status. Anything still open at launch must be hidden or removed, never shipped as if it were fact.

---

## 21. Definition of done

- All Phase acceptance criteria met and the full CI suite green.
- Mobile Lighthouse 90 or higher for performance and 95 or higher for accessibility, best practices and SEO on every template.
- No horizontal scroll or clipped text at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px. Every box aligned to the grid, consistent card heights, consistent radii, nested corners aligned, spacing only from the scale.
- Every indexable page has a unique title, description, canonical and one H1. Sitemap and robots verified. Redirect map verified with no chains or loops.
- Schema validates. Security headers present, CSP running in Report-Only with no violations on key pages.
- Quote form works end to end, including owner and customer emails, and no lead is lost in any tested failure mode.
- The SEO specialist can change a title, description, schema option, redirect and page content in Sanity and see it live within a minute, with no deploy (shown in a walkthrough).
- No secrets in the repository. `PLACEHOLDERS.md` is empty or every remaining item is hidden from the live site.
- Documentation complete and accurate.

---

## 22. First instruction

> Read this file in full. Then begin **Phase 0**. Do not write application code yet. Produce `docs/PLAN.md`, `PLACEHOLDERS.md` and `docs/MANUAL_TASKS.md`, list every question you need answered, and stop at the checkpoint.
