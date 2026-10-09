/**
 * Every GROQ query the site runs. `defineQuery` lets `sanity typegen` generate exact result
 * types (frontend/sanity.types.ts). The same strings run against Sanity in production and
 * against the local seed (groq-js) when no project is configured.
 */
import {defineQuery} from 'next-sanity'

const image = /* groq */ `{
  ...,
  "alt": coalesce(alt, ""),
  asset->{_id, url, "width": metadata.dimensions.width, "height": metadata.dimensions.height, "lqip": metadata.lqip}
}`

const seo = /* groq */ `seo{metaTitle, metaDescription, noindex, canonicalOverride, extraJsonLd, "ogImage": ogImage${image}}`

const serviceCard = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  icon,
  menuSummary,
  cardSummary,
  isEmergency,
  whatsappNoun,
  "cardImage": cardImage${image}
}`

const projectCard = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  summary,
  location,
  completed,
  "before": before${image},
  "after": after${image}
}`

const sections = /* groq */ `sections[]{
  ...,
  _type == "imageTextSection" => {"image": image${image}},
  _type == "gallerySection" => {"projects": projects[]->${projectCard}},
  _type == "relatedServicesSection" => {"services": services[]->${serviceCard}}
}`

export const settingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  businessName, legalName, phoneDisplay, phoneE164, whatsappE164, email, address, geo,
  hoursText, openingHours, serviceAreas, licenceNumber, licenceAuthority, is247,
  dewaShow, dewaShort, dewaText, insuranceText, freeQuotes, responseTime, warranty,
  showPrices, priceNote, gbpUrl, reviewUrl, ratingShow, ratingValue, ratingCount,
  stats, socials, footerDescription, defaultWhatsappMessage, allowAiTraining,
  "defaultOgImage": defaultOgImage${image}
}`)

export const servicesQuery = defineQuery(
  `*[_type == "service" && defined(slug.current)] | order(order asc, title asc)${serviceCard}`,
)

export const serviceQuery = defineQuery(`*[_type == "service" && slug.current == $slug][0]{
  ...${serviceCard},
  _updatedAt,
  schemaServiceType,
  heroHeadline,
  heroSubhead,
  "heroImage": heroImage${image},
  directAnswer,
  ${sections},
  prices,
  showPrices,
  "relatedServices": relatedServices[]->${serviceCard},
  reviewer,
  lastReviewed,
  ${seo}
}`)

export const pageQuery = defineQuery(`*[_type == "page" && key == $key][0]{
  _id,
  _updatedAt,
  key,
  title,
  heroHeadline,
  heroAccent,
  heroSubhead,
  "heroImage": heroImage${image},
  directAnswer,
  cardSummary,
  home{..., steps[]{icon, title, text}, whyItems[]{icon, title, text}},
  ${sections},
  body,
  lastReviewed,
  ${seo}
}`)

/** Which fixed pages are published (used to hide links to unpublished legal pages). */
export const publishedPageKeysQuery = defineQuery(`*[_type == "page" && defined(key)].key`)

export const amcPlansQuery = defineQuery(
  `*[_type == "page" && key in ["amc-residential", "amc-commercial"]] | order(key desc){key, title, heroHeadline, cardSummary}`,
)

export const faqsQuery = defineQuery(
  `*[_type == "faq"] | order(order asc){_id, question, answer, topic, showOnHome}`,
)

export const testimonialsQuery = defineQuery(
  `*[_type == "testimonial" && permissionConfirmed == true] | order(order asc){_id, name, quote, context, rating, source, sourceUrl}`,
)

export const areasQuery = defineQuery(
  `*[_type == "area" && defined(slug.current)] | order(title asc){_id, title, "slug": slug.current, cardSummary}`,
)

export const areaQuery = defineQuery(`*[_type == "area" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  heroHeadline,
  heroSubhead,
  directAnswer,
  ${sections},
  "services": services[]->${serviceCard},
  lastReviewed,
  ${seo}
}`)

export const projectsQuery = defineQuery(
  `*[_type == "project" && defined(slug.current)] | order(completed desc, _createdAt desc)${projectCard}`,
)

export const projectQuery = defineQuery(`*[_type == "project" && slug.current == $slug][0]{
  ...${projectCard},
  _updatedAt,
  "gallery": gallery[]${image},
  body,
  "service": service->${serviceCard},
  "area": area->{title, "slug": slug.current},
  ${seo}
}`)

export const guidesQuery = defineQuery(
  `*[_type == "guide" && defined(slug.current)] | order(publishedAt desc){_id, title, "slug": slug.current, excerpt, publishedAt, "coverImage": coverImage${image}}`,
)

export const guideQuery = defineQuery(`*[_type == "guide" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  excerpt,
  "coverImage": coverImage${image},
  directAnswer,
  body,
  faqs,
  author,
  reviewer,
  publishedAt,
  lastReviewed,
  "relatedServices": relatedServices[]->${serviceCard},
  ${seo}
}`)

export const redirectsQuery = defineQuery(`*[_type == "redirect"]{from, to, type}`)

export const sitemapQuery = defineQuery(`{
  "pages": *[_type == "page" && defined(key)]{key, _updatedAt, "noindex": seo.noindex},
  "services": *[_type == "service" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noindex": seo.noindex},
  "areas": *[_type == "area" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noindex": seo.noindex},
  "projects": *[_type == "project" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noindex": seo.noindex},
  "guides": *[_type == "guide" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noindex": seo.noindex}
}`)

/** Everything that exists, for the proxy's routing-level 404s (see lib/redirects/source.ts). */
export const routingQuery = defineQuery(`{
  "redirects": *[_type == "redirect"]{from, to, type},
  "pages": *[_type == "page" && defined(key)].key,
  "service": *[_type == "service" && defined(slug.current)].slug.current,
  "area": *[_type == "area" && defined(slug.current)].slug.current,
  "project": *[_type == "project" && defined(slug.current)].slug.current,
  "guide": *[_type == "guide" && defined(slug.current)].slug.current
}`)

export const slugsQuery = defineQuery(`*[_type == $type && defined(slug.current)].slug.current`)
