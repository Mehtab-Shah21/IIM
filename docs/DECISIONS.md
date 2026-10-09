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
