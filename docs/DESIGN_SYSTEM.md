# Design system

The visual rules in code form. The live reference is `/style-guide/` (noindex), which shows every token and component at every width. The source of truth is `frontend/styles/tokens.css`. Tailwind is locked to it (`--*: initial` in `globals.css`), so a class that isn't a token doesn't exist.

## 1. Rules the build enforces

- **No arbitrary values or raw colours** in components: `npm run lint` runs `scripts/check-tokens.mjs`, which fails on `bg-[…]`, `p-[13px]`, `#hex` and similar outside `tokens.css`. The only exception is a line marked `// token:` with a reason (used once, for the browser `themeColor`).
- **Contrast**: `npm run check:contrast --workspace=frontend` checks every approved text/background pair against WCAG 2.2 AA (4.5:1 text, 3:1 large text and UI).
- **Budgets**: `npm run check:budgets --workspace=frontend` after a build. Limits:
  - JS: framework baseline + 30 KB gzipped per route.
  - CSS: under 40 KB.
  - Homepage: under 800 KB transferred.
- **Layout**: Playwright checks every template at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px. It fails on horizontal scroll, on any element wider than the viewport, on unequal card heights in a row, and on any count of H1 other than one.
- **Accessibility**: axe (WCAG 2.2 AA) on every template, plus 44 px minimum tap targets on mobile.

## 2. Colour

| Token                                          | Hex                                   | Use                                                              |
| ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `ink-950` / `ink-900` / `ink-800` / `ink-700`  | #0f0f0f / #1a1a1a / #262626 / #3a3a3a | Dark surfaces (header, hero, footer, bands), body text on light  |
| `gold`                                         | #e6b215                               | Large brand panels                                               |
| `accent` / `accent-600`                        | #ffb800 / #e6a600                     | Primary buttons, highlights and links **on dark**; hover         |
| `cream` / `cream-muted`                        | #f5f0de / #c9c3ad                     | Text on dark; secondary text on dark                             |
| `navy`                                         | #002366                               | Headings and links on white or cream sections                    |
| `white`, `neutral-50…600`                      |                                       | Light sections, borders, secondary text on light (`neutral-600`) |
| `success` / `success-bg`, `error` / `error-bg` |                                       | Form states, always with an icon and text, never colour alone    |
| `whatsapp` / `whatsapp-600`                    | #25d366 / #1ebe5a                     | WhatsApp buttons only, with `ink-900` text                       |

**Never:** amber or gold text on white or cream (1.7:1), or white text on amber or gold. On an amber or gold background, text is `ink-900`. Focus rings on amber surfaces use the `focus-on-accent` class (dark ring).

## 3. Type

- Headings: **Plus Jakarta Sans** 700/800. Body: **Inter** 400–700. Both are self-hosted, trimmed copies with size-adjusted fallbacks (`frontend/fonts/README.md`).
- Fluid sizes:
  - `text-h1` 32→56 px
  - `text-h2` 26→40 px
  - `text-h3` 20→26 px
  - `text-h4` 18 px
  - `text-lead` 18→20 px
  - body 16→18 px
  - `text-small`, `text-xs`
- Line height: headings 1.15, body 1.6. Measure: `max-w-prose` (68ch) for reading text.
- One H1 per page. Headings go in order, without skipping levels; section headings are H2.

## 4. Space, shape, depth

- Spacing scale `space-1…10` (4 → 128 px). Sections use the `section` class (64 px vertical, more on large screens). Containers: `container-content` (1200 px) and `container-wide` (1320 px), each with a 16 px gutter.
- Radius:
  - `rounded-sm` (8 px): buttons, inputs, badges.
  - `rounded-md` (12 px): cards, form panels.
  - `rounded-lg` (20 px): hero media, CTA bands.
  - `rounded-pill`: chips, floating buttons.
- Shadows: `shadow-sm` (cards at rest), `shadow-md` (hover, menus), `shadow-lg` (drawer, dialogs).
- Controls are 48 px high; every tap target is at least 44 px.

## 5. Components (`frontend/components/`)

| Component                                                            | Notes                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/Button` — `Button`, `ButtonLink`, `ArrowLink`, `buttonClasses()` | Variants `primary` (amber), `secondary`, `whatsapp`, `ghost`; `tone="dark"` on dark surfaces; `size="bar"` for the mobile action bar; `loading` keeps the label for screen readers. Don't override `display` or `min-height` through `className`: wrap it instead |
| `ui/Card` — `Card`, `PhotoPlaceholder`                               | Whole card clickable through `stretched-link`; equal heights in a row                                                                                                                                                                                             |
| `ui/Field`                                                           | Label always visible, hint and error linked with `aria-describedby`, 16 px minimum font (stops iOS zoom)                                                                                                                                                          |
| `ui/Layout` — `Section`, `SectionHeader`, `Eyebrow`, `Badge`, `Chip` | `Section surface="…"` picks the background (`white`, `neutral`, `cream`, `dark`, `darker`) and the text colours that go with it; `SectionHeader tone="dark"` on dark surfaces                                                                                     |
| `ui/Img`                                                             | The only image component (no `next/image`, ADR-005). Always give `width`, `height` and `sizes`; `priority` only on the LCP image                                                                                                                                  |
| `icons/Icon`                                                         | Lucide icons inlined at build time plus WhatsApp; `aria-hidden` unless given a `label`                                                                                                                                                                            |
| `layout/*`                                                           | Header with mega menu (desktop) and dialog drawer (mobile); footer; mobile action bar (Call, WhatsApp, Get a Quote) and WhatsApp float                                                                                                                            |
| `sections/*`                                                         | Page-builder renderers (`SectionRenderer`) and the fixed homepage, service, area and contract sections                                                                                                                                                            |
| `forms/*`                                                            | Quote form (3 steps; one long form without JS), contract form, Turnstile (lazy)                                                                                                                                                                                   |

## 6. Motion

Only `opacity` and `transform`, 150–300 ms. Reveal-on-scroll applies only below the first screen, so above-the-fold content is never hidden. `prefers-reduced-motion` turns all of it off.

## 7. Adding something new

1. Need a new value? Add a token to `tokens.css` and map it in the `@theme` block in `globals.css`. Don't use an arbitrary value.
2. A new colour pair? Add it to `scripts/check-contrast.mjs` and run it.
3. Add the component to `/style-guide/` so it's tested at every width.
4. Run `npm run lint`, `npm test`, then `npm run build` and `npm run test:e2e --workspace=frontend`.
