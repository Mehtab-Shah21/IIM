# IIM Technical Services: website

A rebuild of www.iimtechnicalservices.com with Next.js 16 (App Router, TypeScript), Tailwind CSS 4 locked to design tokens, and Sanity CMS. It is hosted on Hostinger (Node.js) behind Cloudflare. The brief and working rules are in [CLAUDE.md](CLAUDE.md).

**Status (9 Oct 2026):** all pages, forms, SEO, redirects and tests are built and pass locally on seed content. Going live needs the account steps in [docs/MANUAL_TASKS.md](docs/MANUAL_TASKS.md) and the client answers in [PLACEHOLDERS.md](PLACEHOLDERS.md).

## Quick start

Requires Node 22.12 or later (24 recommended, see `.nvmrc`).

```bash
npm install
```

```bash
npm run dev
```

The site runs at http://localhost:3000 on local seed content: no Sanity account or secrets needed. To use a real Sanity project, copy `frontend/.env.example` to `frontend/.env.local` and fill it in. Run the Studio with `npm run dev:studio` (http://localhost:3333).

## Repository

| Folder      | What                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend/` | Next.js site: `app/` routes, `components/`, `lib/` (content, forms, SEO, security, redirects), `styles/tokens.css`, `proxy.ts` (redirects, 404s, staging auth), `tests/` |
| `studio/`   | Sanity Studio: schemas, desk structure, seed export                                                                                                                      |
| `docs/`     | Plan, decisions, runbook, guides                                                                                                                                         |

## Commands (from the root)

| Command                                           | Does                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev` / `npm run build` / `npm run start` | Next.js development server / production build / serve the build                            |
| `npm run lint`                                    | ESLint plus the design-token check                                                         |
| `npm run typecheck`                               | TypeScript, both workspaces                                                                |
| `npm test`                                        | Unit tests (Vitest)                                                                        |
| `npm run test:e2e`                                | Playwright: journeys, layout at 8 widths, axe, SEO, CSP, redirects (after `npm run build`) |
| `npm run check:budgets --workspace=frontend`      | JS/CSS/page-weight budgets (after a build)                                                 |
| `npm run check:contrast --workspace=frontend`     | WCAG contrast of every approved colour pair                                                |
| `npm run lhci --workspace=frontend`               | Lighthouse CI, mobile (after a build)                                                      |
| `npm run typegen`                                 | Re-extract the Sanity schema and regenerate `frontend/sanity.types.ts`                     |
| `npm run seed:export`                             | Seed content → `studio/seed/seed.ndjson` for the first Sanity import                       |
| `npm run format`                                  | Prettier                                                                                   |

CI (`.github/workflows/ci.yml`) runs all of these on every pull request.

## Documents

| Document                                           | Purpose                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [docs/PLAN.md](docs/PLAN.md)                       | Architecture, versions, risks, phases                              |
| [docs/DECISIONS.md](docs/DECISIONS.md)             | Decision log (ADRs), including the CSP and performance evidence    |
| [docs/MANUAL_TASKS.md](docs/MANUAL_TASKS.md)       | Account and setup steps only a human can do                        |
| [PLACEHOLDERS.md](PLACEHOLDERS.md)                 | Facts and assets awaiting the client; placeholders in the code     |
| [docs/RUNBOOK.md](docs/RUNBOOK.md)                 | Deploy, roll back, backups, incidents                              |
| [docs/SEO_GUIDE.md](docs/SEO_GUIDE.md)             | How the SEO specialist works in the Studio                         |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)     | Tokens, components and the rules the build enforces                |
| [docs/LEAD_AUTOMATION.md](docs/LEAD_AUTOMATION.md) | Make/n8n scenarios and Google Sheet for leads                      |
| [docs/reference/](docs/reference/)                 | Audit of the old Wix site, old-URL redirect map, checked seed copy |

## Credits

Interface effects adapted (rebuilt without their libraries, see `docs/DECISIONS.md` ADR-006) from:

- [Skiper UI](https://skiper-ui.com) by Gurvinder Singh: Skiper 4 (after [toggles.dev](https://toggles.dev) by Alfie Jones), 34, 40, 50 and 106.
- Owner-supplied components "SocialFlipButton", "TextAnimation", "TeamRevealGrid", "CursorCard" and "FaqAccordion" (the accordion's demo text names Vengeance UI; the source of the others was not given).
- Icons: [Lucide](https://lucide.dev) (ISC) and [Simple Icons](https://simpleicons.org) (CC0). Fonts: Inter and Plus Jakarta Sans (SIL OFL 1.1).
