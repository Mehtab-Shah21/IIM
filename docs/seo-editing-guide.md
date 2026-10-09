# Editing guide for the SEO Manager

You log in with your own account (role **SEO Manager**, 2FA required). You can edit every page, service, area, guide, FAQ and project; manage Rank Math (titles, descriptions, schema, sitemap, robots.txt, redirects, 404 monitor); edit **Business Info**; and upload media. You cannot install plugins, change the theme, manage users or open leads. That is deliberate.

## Where things live

| You want to change… | Go to |
|---|---|
| Phone, WhatsApp, email, address, hours, licence, rating, socials | **Business Info** (left menu). Changes apply everywhere: header, footer, contact page, schema. |
| A page's title tag and meta description | Edit the page → **Rank Math** panel → *Edit Snippet* |
| Title/description templates for services, areas, projects, guides | Rank Math → Titles & Meta → Post Types |
| The H1 and intro of a page | Edit the page → **Page intro** box → *H1 headline* and *Subheading* |
| The 40–60 word answer at the top | **Page intro** → *Direct answer* (a live word counter turns red outside 40–60) |
| Page body | **Body sections**: add, reorder or remove fixed layouts (Heading and text, Checklist, Numbered steps, Image and text, Highlighted note) |
| Page FAQ | **Questions and call to action** → FAQ rows. These become FAQPage schema automatically. |
| Sitewide FAQ (FAQ page and homepage) | **FAQs** menu. Tick *Show on the homepage* for 6–8 of them. |
| Redirects | Rank Math → Redirections. Always **301**. Test the old URL in a private window. |
| robots.txt | Rank Math → General Settings → Edit robots.txt. Never delete the `Sitemap:` line. |
| Sitemap | `/sitemap_index.xml` (Rank Math → Sitemap Settings) |
| Breadcrumbs | Rank Math → General Settings → Breadcrumbs (must stay **enabled**: the theme uses them) |

## Rules that keep the site healthy

1. **One H1 per page.** It is the *H1 headline* field. Body section headings are H2s.
2. **Titles 50–60 characters, descriptions 140–155**, unique on every page. Rank Math shows the length.
3. **Original copy only.** Never paste text from another page of this site or from competitors. Each service and area page must say something specific to that service or area.
4. **Only confirmed claims.** "24/7", "DEWA-compliant", "licensed", "free quote", response times, prices and warranty terms appear only after the owner confirms them in writing. Switch claims on in Business Info → *Trust and claims*.
5. **Schema is automatic.** LocalBusiness, Service, FAQPage and AggregateRating come from Business Info and page fields. In Rank Math's Schema tab, keep the default (WebPage or Article). **Do not add FAQ or LocalBusiness schema there too**, or it will be duplicated.
6. **Images:** descriptive file names, alt text that says what the photo shows, real photos only.
7. **Internal links:** every new area or guide page links to at least two relevant service pages, and the relevant service links back.

## Adding a new area page

1. Areas → *Add New*. Title = area name (e.g. "Jumeirah Village Circle").
2. Slug: lowercase with hyphens (`jumeirah-village-circle`). URL becomes `/areas/jumeirah-village-circle/`.
3. *H1 headline*: e.g. "Electrician and plumber in Jumeirah Village Circle, Dubai".
4. *Direct answer*: 40–60 words naming the area, the services and how to book.
5. Body sections: genuinely local content, such as building types in the area, common issues (older villas, high-rise water pressure), and access or parking notes. No copy shared with other area pages.
6. *Services offered here*: pick the services.
7. FAQ: two or three local questions.
8. Rank Math: unique title and description (template: *Electrician & Plumber in {Area}, Dubai | IIM*).
9. Publish. Then add a link to it from at least two relevant service pages.

## Adding a guide

Guides → *Add New*. Fill *Written by*, *Reviewed by* (a named technician) and *Last reviewed*. Start with the direct answer, then the article, then 2–4 FAQs. Link to the related service.

## Checking your work

- Rich Results Test: https://search.google.com/test/rich-results
- Schema validator: https://validator.schema.org
- PageSpeed Insights (mobile): https://pagespeed.web.dev
- Internal style guide (logged in only): `/style-guide/`

FAQ markup is kept so machines can read it. Google shows FAQ rich results only for a few authoritative sites, so do not expect them in search.
