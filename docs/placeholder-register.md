# Placeholder and confirmation register

Every item below is either hidden from visitors until it is filled in, or is draft copy that needs the client's approval. Logged-in editors see hidden items on the site as amber `[CONFIRM: …]` markers. Run `wp iim check` before launch: it lists empty Business Info fields, claims that are switched on, missing secrets and any published `[CONFIRM` text.

## A. Business facts (Business Info screen)

| # | Item | Where it shows | Current state | Source / note |
|---|------|----------------|---------------|---------------|
| A1 | **Phone number** | Header, footer, action bar, contact, schema | Default `+971 50 962 6446` | The old footer displays +971 50 904 4115 but its link dials 962 6446. WhatsApp, schema and contact meta use 962 6446. **Confirm which one.** |
| A2 | WhatsApp number | Every WhatsApp button | Default `+971 50 962 6446` | From the old site's wa.me links |
| A3 | **Public email** | Footer, contact, schema | Default `iim@iimtechnicalservices.com` | The old contact page shows `info@iimuae.com`. **Confirm.** |
| A4 | Lead notification emails | Owner alerts | Empty (falls back to the WP admin email) | Who receives every request? |
| A5 | **Street address / area** | Footer, contact, schema, Google profile | Empty ("Dubai") | Old schema said **Deira**. It must match the Google Business Profile exactly. |
| A6 | Geo coordinates | Schema | Empty | From the Google Business Profile pin |
| A7 | Working hours | Contact, footer, schema | Empty: hidden | |
| A8 | **Trade licence number and authority** | Footer, About | Empty: hidden | |
| A9 | **DEWA compliance proof** | Trust strip, About | Switched off | The old site claims "DEWA-compliant technicians". Keep the claim only with proof. |
| A10 | Insurance details | About | Empty: hidden | |
| A11 | **24/7 emergency claim** | Trust strip, FAQ (draft) | Switched off | The old site title was "24 Hour Electrician". Confirm real availability. |
| A12 | Free quotes | Quote page, FAQ (draft) | Switched off | The old service pages said "Get a FREE quote". |
| A13 | Response time statement | Quote page | Empty: hidden | Only a specific, true statement |
| A14 | Workmanship warranty | Terms (draft) | Empty | |
| A15 | Google Business Profile and reviews links | Reviews, footer, schema sameAs | Empty: hidden | |
| A16 | Google rating and review count | Trust strip, reviews, AggregateRating | Switched off | Real current figures only |
| A17 | Company numbers (jobs, years, areas) | Homepage "Numbers" | Empty: hidden | Real figures only |
| A18 | Social profiles | Footer, schema | Empty: hidden | The old links pointed to wix.com, yelp.com and facebook.com/wix |
| A19 | Areas served | Areas hub, schema areaServed | No Area pages yet | One Area page per real area, each with genuinely local copy |
| A20 | Data retention period | Privacy policy, automatic purge | 24 months (default) | Confirm with the client and legal reviewer |
| A21 | Logo SVG/PNG and brand colours | Header, footer, schema | Text wordmark; colours taken from the live site (#002366 navy, #FFB800 amber) | Upload in Appearance > Customize > Site Identity |

## B. Prices (stored, hidden)

Thirteen AED "from" prices were copied from the old `/book-online` page into each service's price list. Two switches hide them: the master switch in Business Info and one per service. Confirm they are current before switching them on.

| Service | Items |
|---|---|
| Electrical | Fault finding 160, lighting installation 110, DB dressing 260, signage 360 |
| Plumbing | Leak detection 150, water heater 200, sanitary ware 150 |
| AC | Repair 160, routine maintenance 170, deep cleaning 190 |
| Painting | Interior & exterior 1,800 |
| Renovation | Tiling & masonry 150, waterproofing 400 |

## C. Content needing client approval

| # | Item | State |
|---|------|-------|
| C1 | All seeded service, AMC and About copy | Published on **staging** for review. Written for this rebuild; it makes no unconfirmed claims. |
| C2 | Is AC still offered? | AC page built (the old site sells AC). Unpublish it if not. |
| C3 | Are signage, tiling, masonry and waterproofing still offered? | Listed on the Electrical and Renovation pages |
| C4 | Testimonials (Sandeep Kumar, Saifullah Khan, Hamdan Anjum) | Imported from the old site and **hidden** until "Customer agreed to publication" is ticked |
| C5 | FAQ "Are quotes free?" and "Are you available 24 hours a day?" | **Draft** |
| C6 | Privacy policy and Terms | **Draft**; legal review needed. Contain `[CONFIRM]` markers. |
| C7 | Accessibility statement | Draft, ready to publish after a read-through |
| C8 | Old "eco-friendly practices" claim (About page) | Not carried over until confirmed |
| C9 | Old AMC wording "Get your property insured" | Not carried over; it implies insurance |
| C10 | AI training crawlers (GPTBot, Google-Extended, CCBot) | Allowed by default in `server/robots.txt`. Business decision. |
| C11 | Spec draft titles that contained "24/7", "DEWA-compliant", "Licensed" | Seeded without those words. Add them back once A9 and A11 are confirmed. |

## D. Photos and media (all hidden or neutral until supplied)

- Hero photo (optional, 4:3): real team or job photo.
- A 16:10 card image for each service (7).
- Before and after pairs for projects (square crops), plus extra photos per project.
- Technician profiles: name, role, licence, photo, with consent.
- Open Graph share image 1200×630 (Rank Math > Titles & Meta > Global).
- Logo SVG and PNG.

Media rules: descriptive file names (`villa-bathroom-retile-al-barsha.jpg`, never `IMG_2034.jpg`), descriptive alt text, no customer faces or unit numbers without consent.
