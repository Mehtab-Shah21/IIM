import {readFileSync} from 'node:fs'

import {describe, expect, it} from 'vitest'

import sanityImageLoader from '@/lib/sanity/image-loader'
import {
  articleNode,
  breadcrumbNode,
  buildGraph,
  businessNode,
  faqNode,
  parseExtraJsonLd,
  serviceNode,
} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'

const business = {
  businessName: 'IIM Technical Services',
  phoneE164: '+971509626446',
  address: {locality: 'Dubai', region: 'Dubai', country: 'AE'},
  ratingShow: true,
  ratingValue: 4.9,
  ratingCount: 37,
}

describe('buildMetadata', () => {
  it('uses CMS fields as-is with an absolute https://www canonical', () => {
    const m = buildMetadata({
      path: '/services/plumbing-services-dubai/',
      seo: {metaTitle: 'Plumber in Dubai | IIM', metaDescription: 'Desc'},
      fallbackTitle: 'x',
      fallbackDescription: 'y',
    })
    expect(m.title).toEqual({absolute: 'Plumber in Dubai | IIM'})
    expect(m.alternates?.canonical).toBe(
      'https://www.iimtechnicalservices.com/services/plumbing-services-dubai/',
    )
    expect(m.robots).toBeUndefined()
  })
  it('falls back to templates and honours noindex', () => {
    const m = buildMetadata({
      path: '/x/',
      seo: {noindex: true},
      fallbackTitle: 'Fallback',
      fallbackDescription: 'Fallback desc',
    })
    expect(m.title).toEqual({absolute: 'Fallback'})
    expect(m.description).toBe('Fallback desc')
    expect(m.robots).toEqual({index: false, follow: true})
  })
  it('honours a canonical override', () => {
    const m = buildMetadata({
      path: '/a/',
      seo: {canonicalOverride: 'https://www.iimtechnicalservices.com/b/'},
      fallbackTitle: 't',
      fallbackDescription: 'd',
    })
    expect(m.alternates?.canonical).toBe('https://www.iimtechnicalservices.com/b/')
  })
})

describe('JSON-LD', () => {
  it('builds a graph with the required nodes, all JSON-serialisable', () => {
    const g = buildGraph({
      path: '/services/ac-services-dubai/',
      name: 'AC Repair',
      business: businessNode(business, {
        areas: ['Deira'],
        services: [{title: 'AC Services', url: absoluteUrl('/services/ac-services-dubai/')}],
      }),
      crumbs: [
        {name: 'Home', href: '/'},
        {name: 'Services', href: '/services/'},
        {name: 'AC Services'},
      ],
      extra: [
        serviceNode(absoluteUrl('/services/ac-services-dubai/'), {title: 'AC Services'}),
        faqNode(absoluteUrl('/x/'), [{question: 'Q?', answer: 'A.'}]),
      ],
    })
    const parsed = JSON.parse(JSON.stringify(g)) as {
      '@context': string
      '@graph': Array<Record<string, unknown>>
    }
    expect(parsed['@context']).toBe('https://schema.org')
    const types = parsed['@graph'].map((n) => [n['@type']].flat().join('+'))
    expect(types).toEqual([
      'Organization+HomeAndConstructionBusiness+Electrician+Plumber',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
      'Service',
      'FAQPage',
    ])
    for (const node of parsed['@graph'])
      expect(node['@id']).toMatch(/^https:\/\/www\.iimtechnicalservices\.com\//)
  })

  it('only adds AggregateRating where the rating is visible', () => {
    expect(businessNode(business).aggregateRating).toBeUndefined()
    expect(businessNode(business, {ratingVisible: true}).aggregateRating).toMatchObject({
      ratingValue: '4.9',
      reviewCount: 37,
    })
    expect(
      businessNode({...business, ratingShow: false}, {ratingVisible: true}).aggregateRating,
    ).toBeUndefined()
  })

  it('uses 24/7 hours only when switched on', () => {
    expect(businessNode(business).openingHoursSpecification).toBeUndefined()
    const hours = businessNode({...business, is247: true}).openingHoursSpecification as Array<{
      opens: string
      closes: string
    }>
    expect(hours[0]).toMatchObject({opens: '00:00', closes: '23:59'})
  })

  it('numbers breadcrumbs and links the last one to the page', () => {
    const b = breadcrumbNode('https://www.iimtechnicalservices.com/about/', [
      {name: 'Home', href: '/'},
      {name: 'About'},
    ])
    expect(b.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.iimtechnicalservices.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://www.iimtechnicalservices.com/about/',
      },
    ])
  })

  it('skips empty FAQ lists and adds offers only with prices', () => {
    expect(faqNode('u', [])).toBeNull()
    expect(serviceNode('u', {title: 'X'}).offers).toBeUndefined()
    expect(serviceNode('u', {title: 'X'}, [{name: 'Fix', priceFrom: 160}]).offers).toHaveLength(1)
  })

  it('builds an Article with author and dates', () => {
    expect(articleNode('u', {title: 'T', author: 'A', published: '2026-01-01'})).toMatchObject({
      '@type': 'Article',
      author: {'@type': 'Person', name: 'A'},
      datePublished: '2026-01-01',
      dateModified: '2026-01-01',
    })
  })

  it('merges valid extra JSON-LD and ignores invalid input', () => {
    expect(
      parseExtraJsonLd('{"@context":"https://schema.org","@type":"Event","name":"Open day"}'),
    ).toEqual([{'@type': 'Event', name: 'Open day'}])
    expect(parseExtraJsonLd('[{"@type":"A"},{"@type":"B"}]')).toHaveLength(2)
    expect(parseExtraJsonLd('not json')).toEqual([])
  })
})

describe('seed content SEO', () => {
  const docs = JSON.parse(
    readFileSync(new URL('../../content/seed/documents.json', import.meta.url), 'utf8'),
  ) as Array<{
    _id: string
    _type: string
    directAnswer?: string
    seo?: {metaTitle?: string; metaDescription?: string; noindex?: boolean}
  }>
  const indexable = docs.filter((d) => d.seo && !d.seo.noindex && !d._id.startsWith('drafts.'))

  it('has unique titles of 50–60 characters and descriptions of 140–155', () => {
    const titles = indexable.map((d) => d.seo!.metaTitle!)
    expect(new Set(titles).size).toBe(titles.length)
    for (const d of indexable) {
      expect(d.seo!.metaTitle!.length, d._id).toBeGreaterThanOrEqual(50)
      expect(d.seo!.metaTitle!.length, d._id).toBeLessThanOrEqual(60)
      expect(d.seo!.metaDescription!.length, d._id).toBeGreaterThanOrEqual(140)
      expect(d.seo!.metaDescription!.length, d._id).toBeLessThanOrEqual(155)
    }
  })

  it('has 40–60 word direct answers', () => {
    for (const d of docs.filter((x) => x.directAnswer)) {
      const words = d.directAnswer!.trim().split(/\s+/).length
      expect(words, d._id).toBeGreaterThanOrEqual(40)
      expect(words, d._id).toBeLessThanOrEqual(60)
    }
  })

  it('makes no unconfirmed claims in published copy', () => {
    const text = JSON.stringify(docs.filter((d) => !d._id.startsWith('drafts.')))
    for (const claim of [
      /24\/7/,
      /DEWA-compliant technicians/i,
      /\blicensed\b/i,
      /free quote/i,
      /\bbest in Dubai\b/i,
    ]) {
      expect(text, String(claim)).not.toMatch(claim)
    }
  })
})

describe('image loader', () => {
  it('adds width, quality and auto format to Sanity CDN URLs only', () => {
    const url = sanityImageLoader({
      src: 'https://cdn.sanity.io/images/p/d/abc-800x500.jpg?rect=0,0,800,500',
      width: 640,
    })
    expect(url).toContain('w=640')
    expect(url).toContain('q=75')
    expect(url).toContain('auto=format')
    expect(url).toContain('rect=0%2C0%2C800%2C500')
    expect(sanityImageLoader({src: '/local.png', width: 640})).toBe('/local.png')
  })
})
