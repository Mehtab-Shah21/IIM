# Current Site Audit: iimtechnicalservices.com (Wix)

Audited 9 October 2026, before the WordPress rebuild starts. Sources: the live pages, `/sitemap.xml` and its child sitemaps, `/ar_ar-sitemap.xml`, `/robots.txt`, page meta and JSON-LD.

## 1. Findings that change the build spec

| # | Finding | Evidence | Impact on spec |
|---|---------|----------|----------------|
| 1 | **AC services are offered.** | `/services-4-1` "AC Services & Repair"; three AC booking services; `/book-online` meta mentions AC. | Add `/services/ac-services-dubai/` and an AC card. [CONFIRM still offered] |
| 2 | **Prices are already public.** | `/book-online` lists 13 services with AED prices (table below). | Price guidance is possible. [CONFIRM prices are current] |
| 3 | **More sub-services than the menu shows.** | 13 `/service-page/*` URLs. | Use them as sections on each service page and as redirect targets. |
| 4 | **An Arabic copy exists at `/ar/`** (16 URLs, mostly untranslated). | `ar_ar-pages-sitemap.xml` | Arabic is out of scope, so all 16 need 301s to their English equivalents. |
| 5 | **Leftover Wix template pages are indexed.** | 12 `/product-page/*` (eyeglasses, face cleanser, golf sweater…), `/category/all-products`, `/pricing-plans/list` ("No plans available"). | Return 410 Gone. Do not redirect them to the home page. |
| 6 | **The annual contract pages are template junk.** | `/lead-collection`: "Final Sale, Get 30% Off… A Nutrition Plan You Can Stick To". `/registration`: "Limited Offer: 5 Day Bootcamp, Coming Soon in May 2035". | Their redirects are correct as planned; this is a priority to fix. |
| 7 | **Brand colours differ from the spec's proposal.** | The live CSS uses navy `#002366`, amber `#FFB800`, gold `#E6B215` and cream `#F5F0DE`. The logo is black and gold. | Use `#002366` and `#FFB800` instead of `#0B1F3A` and `#F5A300`. [CONFIRM with logo files] |
| 8 | **Contact details are inconsistent in four places.** | Footer text shows +971 50 904 4115 but the link dials +971 50 962 6446. The contact page shows **123-456-7890** and **info@iimuae.com**. The footer shows iim@iimtechnicalservices.com. Schema says **Deira** and 0509626446. | Confirm phone, email and address (Deira?). |
| 9 | **Unfilled template placeholders are live.** | About: "At **[Your Company Name]**…". Privacy policy is Wix's "how to write a privacy policy" text. Accessibility statement has "[Enter Name]". | Real legal pages are needed. [CONFIRM a legal reviewer] |
| 10 | **Google Search Console is verified by meta tag.** | `google-site-verification: xKya_b8OJGmsorqnbKUt9nzB_FkxjXv3AKXXyiW0lJY` | Keep this tag (or verify by DNS) so Search Console access survives the move. |
| 11 | **"Free quote" is already promised.** | Every service page: "Get a FREE Quote Today!" | Supports the free-quote claim. [CONFIRM] |

## 2. Old URL inventory and proposed 301 map

The H1 of each `copy-of-*` page was checked, and it confirms the mapping expected in the spec.

| Old URL | Actual content (H1) | New URL | Code |
|---|---|---|---|
| `/` | Home | `/` | — |
| `/coming-soon-01` | Duplicate of home (canonical points to `/`) | `/` | 301 |
| `/copy-of-ac-services` | Electrical Services | `/services/electrical-services-dubai/` | 301 |
| `/copy-of-electrical-services` | Plumbing Services | `/services/plumbing-services-dubai/` | 301 |
| `/copy-of-plumbing-services` | Painting Services | `/services/painting-services-dubai/` | 301 |
| `/copy-of-painting-services` | Handyman Services | `/services/handyman-services-dubai/` | 301 |
| `/copy-of-handyman-services` | Emergency Services | `/services/emergency-electrician-plumber-dubai/` | 301 |
| `/services-4-1` | AC Services & Repair | `/services/ac-services-dubai/` | 301 |
| `/book-online` | Service list with prices | `/services/` | 301 |
| `/inquiry-services-page` | Services overview | `/services/` | 301 |
| `/service-page/ac-deep-cleaning` | AC Deep Cleaning | `/services/ac-services-dubai/` | 301 |
| `/service-page/ac-routine-maintenance` | AC Routine Maintenance | `/services/ac-services-dubai/` | 301 |
| `/service-page/ac-repair-troubleshooting` | AC Repair | `/services/ac-services-dubai/` | 301 |
| `/service-page/db-dressing-upgrades` | DB Dressing & Upgrades | `/services/electrical-services-dubai/` | 301 |
| `/service-page/electrical-fault-finding` | Electrical Fault Finding | `/services/electrical-services-dubai/` | 301 |
| `/service-page/lighting-installation` | Lighting Installation | `/services/electrical-services-dubai/` | 301 |
| `/service-page/signage-installation` | Signage Installation | `/services/electrical-services-dubai/` | 301 |
| `/service-page/flowing-perfection-zero-leaks` | Hidden leak detection | `/services/plumbing-services-dubai/` | 301 |
| `/service-page/water-heater-services` | Water Heater Services | `/services/plumbing-services-dubai/` | 301 |
| `/service-page/sanitary-ware-installation` | Sanitary Ware Installation | `/services/plumbing-services-dubai/` | 301 |
| `/service-page/waterproofing-solutions` | Waterproofing | `/services/home-renovation-dubai/` | 301 |
| `/service-page/tiling-masonry` | Tiling & Masonry | `/services/home-renovation-dubai/` | 301 |
| `/service-page/interior-exterior-painting` | Painting | `/services/painting-services-dubai/` | 301 |
| `/lead-collection` | Residential AMC (template junk) | `/annual-maintenance-contract/residential/` | 301 |
| `/registration` | Commercial AMC (template junk) | `/annual-maintenance-contract/commercial/` | 301 |
| `/about-us` | About | `/about/` | 301 |
| `/contact` | Contact | `/contact/` | 301 |
| `/privacy-policy` | Privacy | `/privacy-policy/` | 301 |
| `/accessibility-statement` | Accessibility | `/accessibility/` | 301 |
| `/pricing-plans/list` | Empty Wix plans page | — | 410 |
| `/category/all-products` | Wix demo store | — | 410 |
| `/product-page/*` (12 URLs) | Wix demo products | — | 410 |
| `/ar` and `/ar/*` (16 URLs) | Arabic copies | the English equivalent of each row above | 301 |

The trailing-slash-less forms (`/about-us`) and the slash forms both need to resolve in a single hop.

## 3. Published prices (from `/book-online`, all "1 hr", AED)

| Service | AED | New page |
|---|---|---|
| AC Deep Cleaning | 190 | AC |
| AC Routine Maintenance | 170 | AC |
| AC Repair & Troubleshooting | 160 | AC |
| DB Dressing & Upgrades | 260 | Electrical |
| Electrical Fault Finding | 160 | Electrical |
| Lighting Installation | 110 | Electrical |
| Signage Installation | 360 | Electrical |
| Leak detection ("Flowing Perfection, Zero Leaks") | 150 | Plumbing |
| Water Heater Services | 200 | Plumbing |
| Sanitary Ware Installation | 150 | Plumbing |
| Interior & Exterior Painting | 1,800 | Painting |
| Tiling & Masonry | 150 | Renovation |
| Waterproofing Solutions | 400 | Renovation |

These are published as "from" prices only after the client confirms them. They are stored as ACF fields so they can be hidden with one switch.

## 4. Other content worth keeping (rewrite, don't copy)

- Hero line "Your Property, Our Priority."
- The 3-step booking: tap WhatsApp, share a photo or video, send location and date. Pay after the service.
- AMC pitch: "Premium Care, Beyond Compare". The current wording "Get your property insured" implies insurance and should be reworded unless the client is an insurer. [CONFIRM]
- About page advantages: fast response, licensed technicians, transparent pricing, customised contracts, eco-friendly practices. [CONFIRM the eco claim]
- AMC benefit: priority 24/7 response.
- Testimonials: Sandeep Kumar (AMC), Saifullah Khan (emergency repair, business), Hamdan Anjum (custom maintenance). [CONFIRM permission]
- Business name in the logo: **IIM Technical Services L.L.C.**

## 5. Current SEO state

- Home title: "24 Hour Electrician | IIM – Professional Emergency Services" (single-keyword focus, as noted in the spec).
- Five service pages have no meta description.
- `og:site_name` and the schema name are just "IIM".
- Canonical host is `https://www.iimtechnicalservices.com`. Keep it.
- Image alt text uses file names ("IIM CONTACT.png", "magic_edit#TUFIS…"), confirming the spec finding.
- The current `robots.txt` blocks PetalBot and crawl-delays AhrefsBot and dotbot. Decide whether to keep this. [CONFIRM with the SEO specialist]

## 6. Additional open items for the client

1. Is AC still a service? (The site sells it, but the spec omits it.)
2. Are the 13 prices above current, and may they be shown as "from" prices?
3. Which email is correct: iim@iimtechnicalservices.com or info@iimuae.com?
4. Is the business address in Deira? Is there a full street address for the Google Business Profile?
5. Keep or remove the eco-friendly claim and the "insured" wording?
6. Are signage, tiling, masonry and waterproofing still offered?
