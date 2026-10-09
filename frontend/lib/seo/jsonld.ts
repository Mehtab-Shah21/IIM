/**
 * JSON-LD builder: one @graph per page, generated from CMS content (CLAUDE.md §11).
 * Every page: Organization (also typed as LocalBusiness subtypes), WebSite, WebPage,
 * BreadcrumbList. Plus Service, FAQPage and Article where relevant. AggregateRating only when
 * the rating is switched on and visible on that page. The editor's extraJsonLd is merged.
 */
import {absoluteUrl} from './metadata'

type Node = Record<string, unknown>

export type BusinessInfo = {
  businessName?: string | null
  legalName?: string | null
  phoneE164?: string | null
  email?: string | null
  address?: {
    street?: string | null
    locality?: string | null
    region?: string | null
    country?: string | null
  } | null
  geo?: {lat?: number | null; lng?: number | null} | null
  openingHours?: Array<{
    days?: string[] | null
    opens?: string | null
    closes?: string | null
  }> | null
  is247?: boolean | null
  serviceAreas?: string[] | null
  socials?: Array<{url?: string | null}> | null
  gbpUrl?: string | null
  ratingShow?: boolean | null
  ratingValue?: number | null
  ratingCount?: number | null
  licenceNumber?: string | null
}

export type Crumb = {name: string; href?: string}

export const ids = {
  org: () => absoluteUrl('/#organization'),
  website: () => absoluteUrl('/#website'),
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function businessNode(
  b: BusinessInfo,
  opts: {
    areas?: string[]
    services?: Array<{title: string; url: string}>
    ratingVisible?: boolean
    logoUrl?: string
  } = {},
): Node {
  const areaNames = opts.areas?.length ? opts.areas : (b.serviceAreas ?? [])
  const hours = b.is247
    ? [{'@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '00:00', closes: '23:59'}]
    : (b.openingHours ?? [])
        .filter((h) => h.days?.length && h.opens && h.closes)
        .map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes,
        }))
  const sameAs = [...(b.socials ?? []).map((s) => s.url), b.gbpUrl].filter((u): u is string =>
    Boolean(u),
  )
  const node: Node = {
    '@type': ['Organization', 'HomeAndConstructionBusiness', 'Electrician', 'Plumber'],
    '@id': ids.org(),
    name: b.businessName,
    legalName: b.legalName || undefined,
    url: absoluteUrl('/'),
    telephone: b.phoneE164 || undefined,
    email: b.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address?.street || undefined,
      addressLocality: b.address?.locality || 'Dubai',
      addressRegion: b.address?.region || 'Dubai',
      addressCountry: b.address?.country || 'AE',
    },
    areaServed: [
      ...areaNames.map((n) => ({'@type': 'Place', name: `${n}, Dubai`})),
      {'@type': 'City', name: 'Dubai'},
    ],
  }
  if (opts.logoUrl) {
    node.logo = opts.logoUrl
    node.image = opts.logoUrl
  }
  if (b.geo?.lat && b.geo?.lng)
    node.geo = {'@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng}
  if (hours.length) node.openingHoursSpecification = hours
  if (sameAs.length) node.sameAs = sameAs
  if (b.licenceNumber)
    node.identifier = {'@type': 'PropertyValue', name: 'Trade licence', value: b.licenceNumber}
  if (opts.services?.length) {
    node.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Maintenance and repair services',
      itemListElement: opts.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {'@type': 'Service', name: s.title, url: s.url},
      })),
    }
  }
  if (opts.ratingVisible && b.ratingShow && b.ratingValue && (b.ratingCount ?? 0) > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(b.ratingValue),
      reviewCount: b.ratingCount,
      bestRating: '5',
    }
  }
  return prune(node)
}

export function breadcrumbNode(url: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? {item: absoluteUrl(c.href)} : {item: url}),
    })),
  }
}

export function faqNode(
  url: string,
  faqs: Array<{question?: string | null; answer?: string | null}>,
): Node | null {
  const items = faqs.filter((f) => f.question && f.answer)
  if (!items.length) return null
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {'@type': 'Answer', text: f.answer},
    })),
  }
}

export function serviceNode(
  url: string,
  s: {title: string; serviceType?: string | null; description?: string | null; areas?: string[]},
  prices?: Array<{name?: string | null; priceFrom?: number | null}> | null,
): Node {
  const offers = (prices ?? []).filter((p) => p.name && typeof p.priceFrom === 'number')
  return prune({
    '@type': 'Service',
    '@id': `${url}#service`,
    name: s.title,
    serviceType: s.serviceType || s.title,
    url,
    description: s.description || undefined,
    provider: {'@id': ids.org()},
    areaServed: [
      ...(s.areas ?? []).map((n) => ({'@type': 'Place', name: `${n}, Dubai`})),
      {'@type': 'City', name: 'Dubai'},
    ],
    ...(offers.length
      ? {
          offers: offers.map((p) => ({
            '@type': 'Offer',
            name: p.name,
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: p.priceFrom,
              priceCurrency: 'AED',
            },
          })),
        }
      : {}),
  })
}

export function articleNode(
  url: string,
  a: {
    title: string
    description?: string | null
    author?: string | null
    reviewer?: string | null
    published?: string | null
    modified?: string | null
    image?: string
  },
): Node {
  return prune({
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: a.title,
    description: a.description || undefined,
    mainEntityOfPage: {'@id': `${url}#webpage`},
    author: a.author ? {'@type': 'Person', name: a.author} : {'@id': ids.org()},
    reviewedBy: a.reviewer ? {'@type': 'Person', name: a.reviewer} : undefined,
    publisher: {'@id': ids.org()},
    datePublished: a.published || undefined,
    dateModified: a.modified || a.published || undefined,
    image: a.image,
  })
}

/** Parses the editor's extraJsonLd; invalid JSON is ignored (it is also validated in the Studio). */
export function parseExtraJsonLd(raw?: string | null): Node[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    return list
      .filter((n): n is Node => typeof n === 'object' && n !== null)
      .map((n) => {
        const rest = {...(n as Node)}
        delete rest['@context']
        return rest
      })
  } catch {
    return []
  }
}

export function buildGraph({
  path,
  name,
  description,
  business,
  crumbs,
  extra = [],
  modified,
  pageType = 'WebPage',
}: {
  path: string
  name: string
  description?: string | null
  business: Node
  crumbs: Crumb[]
  extra?: Array<Node | null | undefined>
  modified?: string | null
  pageType?: 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage' | 'FAQPage'
}) {
  const url = absoluteUrl(path)
  const website: Node = {
    '@type': 'WebSite',
    '@id': ids.website(),
    url: absoluteUrl('/'),
    name: business.name,
    publisher: {'@id': ids.org()},
    inLanguage: 'en',
  }
  const webpage = prune({
    '@type': pageType === 'FAQPage' ? 'WebPage' : pageType,
    '@id': `${url}#webpage`,
    url,
    name,
    description: description || undefined,
    isPartOf: {'@id': ids.website()},
    about: {'@id': ids.org()},
    breadcrumb: {'@id': `${url}#breadcrumb`},
    dateModified: modified || undefined,
    inLanguage: 'en',
  })
  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      website,
      webpage,
      breadcrumbNode(url, crumbs),
      ...extra.filter((n): n is Node => Boolean(n)),
    ],
  }
}

function prune<T extends Node>(node: T): T {
  for (const k of Object.keys(node)) if (node[k] === undefined) delete node[k]
  return node
}
