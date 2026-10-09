# SEO guide (for the SEO specialist)

Everything here is done in Sanity Studio. No code changes and no deploys: published changes reach the site within seconds.

## 1. What the site already does for you

- **Titles and descriptions** come from each document's **SEO** panel. If a field is empty, the site writes one from a template. The template is acceptable, but a hand-written one is better.
- **Canonical URLs** are automatic (`https://www.iimtechnicalservices.com/…/`, always with a trailing slash).
- **Structured data** is generated on every page:
  - `Organization` / `HomeAndConstructionBusiness` from **Site settings**, plus `WebSite` and `BreadcrumbList`.
  - `Service` on service pages, `FAQPage` wherever FAQs show, and `Article` on guides.
  - Don't add these again by hand.
- **Sitemap** (`/sitemap.xml`) lists every published, indexable page with its last-updated date. Drafts, `noindex` pages, the thank-you page and the style guide are left out.
- **robots.txt** blocks everything on staging. On production it allows search engines. AI-training crawlers follow the **Allow AI training** switch in Site settings (an owner decision, PLACEHOLDERS C1).
- **Old Wix URLs** are redirected (301) or marked gone (410), one hop each, from the **Redirects** list.
- **Unconfirmed claims** stay hidden: 24/7, DEWA, free quotes, prices and ratings each have a switch in Site settings, and they appear only once the owner confirms them (PLACEHOLDERS A8–A19). Never write them into body text instead.

## 2. Writing a page

| Field                          | Rule                                                                                                                                           | Studio helps                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Meta title                     | 50–60 characters, unique, main service + Dubai first, brand last if it fits. Example: `Plumbing Services in Dubai, Leaks to Refits \| IIM`     | Live counter; warning outside 50–60                                                                                       |
| Meta description               | 140–155 characters, unique, what you do, where, and the next step (call, WhatsApp, quote)                                                      | Live counter and a Google-style preview                                                                                   |
| H1 (page title / hero heading) | One per page, says the service and the city                                                                                                    | —                                                                                                                         |
| Direct answer                  | 40–60 words, answers the page's main question first, in plain words. Answer engines quote it.                                                  | Word counter; required on service, area and guide pages                                                                   |
| Last reviewed                  | Set it whenever you've checked the page is still accurate                                                                                      | Shown on the page                                                                                                         |
| Slug                           | Lowercase words with hyphens. **Changing it changes the URL**: add a redirect from the old path the same day                                   | Warning on the field                                                                                                      |
| Image alt text                 | Describe what's in the photo ("Technician replacing a mixer tap in a Dubai Marina kitchen"). Leave alt empty only for purely decorative images | Example in the field's help text (the Studio can't tell a decorative image from a missing description, so this is on you) |

British English, and no claims the owner hasn't confirmed (prices, response times, warranties, ratings).

## 3. FAQs

- FAQ documents have a **topic** (booking, services, emergencies, contracts). **Show on home** puts one on the homepage.
- A page's FAQ section produces `FAQPage` schema automatically. The question and answer must also be visible on the page, which they are.
- Write questions the way customers ask them ("How much does it cost to fix a leaking pipe in Dubai?"). Answer in the first sentence.

## 4. Redirects

**Redirects** in the Studio sidebar. Each one has:

- `from`: the old path, for example `/about-us`. Case and trailing slashes don't matter.
- `type`: 301 permanent, 302 temporary, or 410 gone.
- `to`: a new path or full URL; not used for 410.
- `note`: why the redirect exists.

A `from` ending in `/*` matches everything under it. The site collapses chains (A → B → C becomes A → C) and ignores loops. Changes apply within 60 seconds. Check a redirect afterwards in a private window.

Use **410** only for pages that are gone with no replacement, such as the old Wix store products. Otherwise redirect to the closest page, not to the homepage.

## 5. Things not to do

- Don't put the same title or description on two pages. The e2e tests fail the build on duplicates in the seed, but not on live content.
- Don't use **Extra structured data** unless you know exactly why. It is merged into the page graph, and broken JSON is rejected by the Studio, but wrong-but-valid schema isn't caught.
- Don't use the **Canonical URL override** except for a page that genuinely duplicates another.
- Don't tick **noindex** on a page that has visitors from search: it drops out of Google within days.

## 6. After launch

- Search Console: submit `/sitemap.xml`. For four weeks, check **Pages → Not found (404)** weekly and add redirects for real old URLs.
- Rich results: test a service page and the FAQ page in Google's Rich Results Test after any schema-affecting change.
- Measure with PageSpeed Insights (mobile) monthly. The lab results and their limits are in `docs/DECISIONS.md` ADR-005.
