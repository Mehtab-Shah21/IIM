#!/usr/bin/env node
/**
 * Builds frontend/content/seed/documents.json: the starter content as Sanity documents.
 *
 * Inputs (reviewed, original copy; see docs/reference/):
 *   - seed-copy.json            services, AMC pages, About, legal pages, FAQs, testimonials
 *   - old-url-redirect-map.csv  old Wix URLs -> new URLs
 * plus the homepage, hub and utility page copy below.
 *
 * Output is consumed by:
 *   - the frontend fixture mode (no Sanity project configured)
 *   - studio/scripts/export-seed.ts -> NDJSON for `sanity dataset import`
 *
 * Unconfirmed claims (24/7, DEWA, licensed, free quotes, response times) are deliberately
 * absent; they are switched on in Sanity once confirmed (PLACEHOLDERS.md).
 *
 * Run: node scripts/build-seed.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const copy = JSON.parse(readFileSync(join(root, 'docs/reference/seed-copy.json'), 'utf8'))
const today = new Date().toISOString().slice(0, 10)

let keyCounter = 0
const key = () => `k${(++keyCounter).toString(36).padStart(5, '0')}`

/* ---------- HTML-ish copy -> Portable Text ---------- */

function spans(html) {
  const out = []
  const re = /<strong>(.*?)<\/strong>/g
  let last = 0
  let m
  while ((m = re.exec(html))) {
    if (m.index > last) out.push({_type: 'span', _key: key(), text: decode(html.slice(last, m.index)), marks: []})
    out.push({_type: 'span', _key: key(), text: decode(m[1]), marks: ['strong']})
    last = m.index + m[0].length
  }
  if (last < html.length) out.push({_type: 'span', _key: key(), text: decode(html.slice(last)), marks: []})
  return out.filter((s) => s.text !== '')
}

function decode(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function block(html, style = 'normal', listItem) {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: spans(html.trim()),
    ...(listItem ? {listItem, level: 1} : {}),
  }
}

/** Converts the small HTML subset used in the reference copy (p, h2, h3, ul/li, strong). */
function htmlToPt(html) {
  const blocks = []
  const re = /<(p|h2|h3|ul)>([\s\S]*?)<\/\1>/g
  let m
  while ((m = re.exec(html))) {
    const [, tag, inner] = m
    if (tag === 'ul') {
      for (const li of inner.matchAll(/<li>([\s\S]*?)<\/li>/g)) blocks.push(block(li[1], 'normal', 'bullet'))
    } else {
      blocks.push(block(inner, tag === 'p' ? 'normal' : tag))
    }
  }
  return blocks
}

const paras = (...texts) => texts.map((t) => block(t))

/* ---------- Sections ---------- */

function section(s) {
  switch (s.acf_fc_layout) {
    case 'checklist':
      return {_type: 'checklistSection', _key: key(), heading: s.heading, intro: s.intro || undefined, items: s.items}
    case 'text':
      return {_type: 'richTextSection', _key: key(), heading: s.heading, body: htmlToPt(s.body)}
    case 'callout':
      return {_type: 'calloutSection', _key: key(), heading: s.heading || undefined, text: s.text}
    case 'steps':
      return {
        _type: 'stepsSection',
        _key: key(),
        heading: s.heading,
        items: s.items.map((i) => ({_type: 'step', _key: key(), title: i.title, text: i.text})),
      }
    default:
      throw new Error(`Unknown section layout ${s.acf_fc_layout}`)
  }
}

const faqList = (heading, faqs) => ({
  _type: 'faqListSection',
  _key: key(),
  heading,
  items: faqs.map((f) => ({_type: 'faqItem', _key: key(), question: f.question, answer: f.answer})),
})

const seo = (metaTitle, metaDescription, extra = {}) => ({_type: 'seo', metaTitle, metaDescription, noindex: false, ...extra})
const ref = (id) => ({_type: 'reference', _ref: id, _key: key()})

/* ---------- Documents ---------- */

const docs = []

docs.push({
  _id: 'siteSettings',
  _type: 'siteSettings',
  businessName: 'IIM Technical Services',
  legalName: 'IIM Technical Services L.L.C.',
  // [CONFIRM] A1: the old footer showed +971 50 904 4115 but dialled this number.
  phoneDisplay: '+971 50 962 6446',
  phoneE164: '+971509626446',
  whatsappE164: '+971509626446',
  // [CONFIRM] A3: the old contact page showed info@iimuae.com.
  email: 'iim@iimtechnicalservices.com',
  address: {locality: 'Dubai', region: 'Dubai', country: 'AE'},
  footerDescription:
    'Electrical, plumbing, AC, painting, handyman and renovation services for homes and businesses across Dubai.',
  defaultWhatsappMessage: 'Hi IIM, I would like to book a service in Dubai.',
  is247: false,
  dewaShow: false,
  dewaShort: 'DEWA-compliant work',
  freeQuotes: false,
  showPrices: false,
  priceNote: 'Final price is confirmed after we see the job. You pay after the service.',
  ratingShow: false,
  stats: [],
  socials: [],
  serviceAreas: [],
  openingHours: [],
  allowAiTraining: true,
})

const serviceIds = copy.services.map((s) => `service-${s.slug}`)

copy.services.forEach((s, i) => {
  const id = `service-${s.slug}`
  const related = [serviceIds[(i + 1) % serviceIds.length], serviceIds[(i + 2) % serviceIds.length]]
  docs.push({
    _id: id,
    _type: 'service',
    title: s.title,
    slug: {_type: 'slug', current: s.slug},
    order: s.order,
    icon: s.icon,
    menuSummary: s.menu_summary,
    cardSummary: s.card_summary,
    isEmergency: s.slug.includes('emergency'),
    whatsappNoun: s.whatsapp_noun,
    schemaServiceType: s.schema_type,
    heroHeadline: s.hero_headline,
    heroSubhead: s.hero_subhead,
    directAnswer: s.direct_answer,
    sections: [...s.sections.map(section), faqList(`${s.title}: common questions`, s.faqs)],
    prices: s.prices.map((p) => ({_type: 'priceItem', _key: key(), name: p.name, priceFrom: p.price_from, note: p.note || undefined})),
    showPrices: false,
    relatedServices: related.map(ref),
    lastReviewed: today,
    seo: seo(s.seo_title, s.seo_description),
  })
})

const pageCopy = Object.fromEntries(copy.pages.map((p) => [p.slug, p]))

function pageFromCopy(slug, key_, extra = {}) {
  const p = pageCopy[slug]
  const f = p.fields || {}
  return {
    _id: `page-${key_}`,
    _type: 'page',
    key: key_,
    title: p.title,
    heroHeadline: f.hero_headline,
    heroSubhead: f.hero_subhead,
    directAnswer: f.direct_answer,
    cardSummary: f.card_summary,
    sections: [...(p.sections || []).map(section), ...(p.faqs?.length ? [faqList(extra.faqHeading || 'Common questions', p.faqs)] : [])],
    body: p.content ? htmlToPt(p.content) : undefined,
    lastReviewed: today,
    seo: seo(p.seo_title, p.seo_description, extra.noindex ? {noindex: true} : {}),
  }
}

docs.push({
  ...pageFromCopy('home', 'home'),
  title: 'Home',
  heroHeadline: 'Electricians, plumbers and handymen in Dubai.',
  heroAccent: 'Your property, our priority.',
  heroSubhead:
    'Book in three steps on WhatsApp or online. A technician visits at a time that suits you, and you pay after the job is done.',
  home: {
    servicesHeading: 'One team for every repair in your home or business',
    servicesIntro:
      'From a tripped breaker to a full bathroom refit, our technicians handle the job end to end across Dubai.',
    steps: [
      {_type: 'iconItem', _key: key(), icon: 'message-circle', title: 'Message us', text: 'Tap WhatsApp or fill in the quote form. Tell us what is wrong in a sentence or two.'},
      {_type: 'iconItem', _key: key(), icon: 'camera', title: 'Show us the issue', text: 'Send a photo or a short video. It helps the technician bring the right parts the first time.'},
      {_type: 'iconItem', _key: key(), icon: 'calendar-check', title: 'Pick a place and time', text: 'Share your location and the date that suits you. We confirm the visit before we come.'},
    ],
    whyHeading: 'Straightforward maintenance, done properly',
    whyItems: [
      {_type: 'iconItem', _key: key(), icon: 'wallet', title: 'Pay after the service', text: 'You pay once the work is done and you have checked it.'},
      {_type: 'iconItem', _key: key(), icon: 'message-circle', title: 'Simple booking', text: 'Three steps on WhatsApp or online. A photo of the problem replaces a long explanation.'},
      {_type: 'iconItem', _key: key(), icon: 'wrench', title: 'One team, many trades', text: 'Electrical, plumbing, AC, painting and handyman work from one company, so one visit can cover several jobs.'},
      {_type: 'iconItem', _key: key(), icon: 'calendar-check', title: 'Annual contracts', text: 'Scheduled check-ups and priority visits for homes and businesses that want fewer surprises.'},
    ],
    amcHeading: 'Premium care, all year round',
    amcText:
      'One yearly plan covers regular check-ups of your electrical, plumbing and AC systems, with priority response when something goes wrong.',
    amcBullets: [
      'Scheduled preventive visits, so small faults are caught early',
      'Priority response for contract customers',
      'Plans for apartments, villas, offices and shops',
      'One point of contact for every trade',
    ],
    faqHeading: 'Questions people ask before booking',
    ctaHeading: 'Tell us what needs fixing',
    ctaText:
      'Send a photo or a short video on WhatsApp, or fill in the quote form. We confirm a visit time, do the work, and you pay after the job is done.',
  },
})

docs.push({...pageFromCopy('annual-maintenance-contract', 'amc', {faqHeading: 'Annual contract questions'}), title: 'Annual Maintenance Contract'})
docs.push({...pageFromCopy('residential', 'amc-residential', {faqHeading: 'Questions about this plan'})})
docs.push({...pageFromCopy('commercial', 'amc-commercial', {faqHeading: 'Questions about this plan'})})
docs.push(pageFromCopy('about', 'about'))
docs.push({
  ...pageFromCopy('contact', 'contact'),
  heroSubhead: 'Call, WhatsApp or email us. For the fastest reply, send a photo of the issue on WhatsApp.',
})
docs.push({
  ...pageFromCopy('get-a-quote', 'get-a-quote'),
  heroHeadline: 'Get a quote',
  heroSubhead: 'Tell us the issue and choose a time. We reply to confirm the visit, and you pay after the service.',
})
docs.push({
  ...pageFromCopy('thank-you', 'thank-you', {noindex: true}),
  heroHeadline: 'Thank you, we have your request',
  seo: {_type: 'seo', metaTitle: 'Thank you | IIM Technical Services', metaDescription: 'Your request has been received.', noindex: true},
})
docs.push({
  ...pageFromCopy('reviews', 'reviews'),
  heroSubhead: 'What customers say about our work, in their own words.',
})
docs.push({
  ...pageFromCopy('faq', 'faq'),
  heroSubhead: 'Answers about booking, payment, emergencies and annual contracts.',
})
for (const [slug, k] of [
  ['privacy-policy', 'privacy-policy'],
  ['terms', 'terms'],
  ['accessibility', 'accessibility'],
]) {
  const p = pageFromCopy(slug, k)
  // Privacy and terms wait for legal review (PLACEHOLDERS A23); the accessibility statement makes no legal claims.
  docs.push({...p, heroHeadline: pageCopy[slug].title, _draftOnly: k !== 'accessibility'})
}

// Hub pages (new copy).
docs.push({
  _id: 'page-services',
  _type: 'page',
  key: 'services',
  title: 'Services hub',
  heroHeadline: 'Home maintenance and repair services in Dubai',
  heroSubhead:
    'Electrical, plumbing, AC, painting, handyman, renovation and emergency repairs for apartments, villas, offices and shops. Book in three steps and pay after the service.',
  seo: seo(
    'Home Maintenance & Repair Services in Dubai | IIM Experts',
    'Electrical, plumbing, AC, painting, handyman and renovation services for Dubai homes and businesses. Book on WhatsApp in 3 steps and pay after the service.',
  ),
})
docs.push({
  _id: 'page-areas',
  _type: 'page',
  key: 'areas',
  title: 'Areas hub',
  heroHeadline: 'Areas we serve in Dubai',
  heroSubhead: 'Choose your community to see the services we offer there and how to book a visit.',
  seo: seo(
    'Areas We Serve in Dubai | IIM Technical Services Coverage',
    'See the Dubai communities where IIM Technical Services provides electrical, plumbing, AC and maintenance services, and book a visit in three simple steps.',
  ),
})
docs.push({
  _id: 'page-projects',
  _type: 'page',
  key: 'projects',
  title: 'Projects hub',
  heroHeadline: 'Our work in Dubai',
  heroSubhead: 'Real electrical, plumbing, painting and renovation jobs completed by our team.',
  seo: seo(
    'Our Work | Completed Projects in Dubai | IIM Technical',
    'Photos of real electrical, plumbing, painting and renovation jobs completed by IIM Technical Services in Dubai homes and businesses, before and after.',
  ),
})
docs.push({
  _id: 'page-guides',
  _type: 'page',
  key: 'guides',
  title: 'Guides hub',
  heroHeadline: 'Home maintenance guides for Dubai homes',
  heroSubhead: 'Practical advice on electrical safety, plumbing problems and keeping your property in shape through the Dubai summer.',
  seo: seo(
    'Home Maintenance Guides for Dubai Homes | IIM Technical',
    'Practical advice from IIM Technical Services on electrical safety, plumbing problems, AC care and keeping Dubai homes in good shape through the summer.',
  ),
})

// FAQs (draft-only ones become Sanity drafts).
const topicMap = {'booking-and-payment': 'booking', services: 'services', emergencies: 'emergencies', 'annual-contracts': 'contracts'}
copy.faqs.forEach((f, i) => {
  const id = `faq-${i + 1}`
  docs.push({
    _id: f.status === 'draft' ? `drafts.${id}` : id,
    _type: 'faq',
    question: f.q,
    answer: f.a,
    topic: topicMap[f.topic],
    showOnHome: Boolean(f.home),
    order: i + 1,
  })
})

// Testimonials from the old site: hidden until the customers agree to publication.
copy.testimonials.forEach((t, i) => {
  docs.push({
    _id: `testimonial-${i + 1}`,
    _type: 'testimonial',
    name: t.name,
    quote: t.text,
    context: t.context,
    source: 'Direct',
    permissionConfirmed: false,
    order: i + 1,
  })
})

// Redirects: old Wix URLs (verified against each page's real H1, see the audit).
const csv = readFileSync(join(root, 'docs/reference/old-url-redirect-map.csv'), 'utf8').trim().split(/\r?\n/).slice(1)
const redirects = []
for (const line of csv) {
  const [from, to, code, note] = line.split(',')
  if (!from || from === '/contact' || from === '/privacy-policy') continue // the trailing-slash rule handles these
  if (from === '/ar/*') continue // expanded below
  if (code === '410') redirects.push({from: from.replace('/*', '/*'), type: '410', note})
  else redirects.push({from, to, type: '301', note})
}
// Arabic copies: the 16 URLs listed in ar_ar-pages-sitemap.xml, each to its English equivalent.
const englishFor = Object.fromEntries(redirects.filter((r) => r.type === '301').map((r) => [r.from, r.to]))
const arabic = [
  ['/ar', '/'],
  ['/ar/contact', '/contact/'],
  ['/ar/privacy-policy', '/privacy-policy/'],
  ...[
    '/copy-of-handyman-services',
    '/coming-soon-01',
    '/services-4-1',
    '/copy-of-ac-services',
    '/accessibility-statement',
    '/lead-collection',
    '/book-online',
    '/copy-of-painting-services',
    '/copy-of-electrical-services',
    '/about-us',
    '/registration',
    '/inquiry-services-page',
    '/copy-of-plumbing-services',
  ].map((p) => [`/ar${p}`, englishFor[p]]),
]
for (const [from, to] of arabic) {
  if (!to) throw new Error(`No English target for ${from}`)
  redirects.push({from, to, type: '301', note: 'Arabic copy of the old Wix site'})
}
redirects.forEach((r, i) => docs.push({_id: `redirect-${String(i + 1).padStart(3, '0')}`, _type: 'redirect', ...r}))

// Draft-only pages become Sanity drafts (published once legal review is done).
const out = docs.map(({_draftOnly, ...d}) => (_draftOnly ? {...d, _id: `drafts.${d._id}`} : d))

writeFileSync(join(here, '..', 'content', 'seed', 'documents.json'), `${JSON.stringify(out, null, 2)}\n`)
console.info(`Wrote ${out.length} documents (${redirects.length} redirects).`)
