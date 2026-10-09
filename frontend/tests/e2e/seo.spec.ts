import {expect, test} from '@playwright/test'

import {indexable} from './helpers'

const ORIGIN = 'https://www.iimtechnicalservices.com'

test('every indexable page: unique title and description, one H1, canonical, valid JSON-LD', async ({
  request,
}) => {
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()

  for (const path of indexable) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
    const html = await res.text()

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/&amp;/g, '&') ?? ''
    const description =
      html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.replace(/&amp;/g, '&') ?? ''
    expect(title.length, `${path} title "${title}"`).toBeGreaterThanOrEqual(50)
    expect(title.length, `${path} title "${title}"`).toBeLessThanOrEqual(60)
    expect(description.length, `${path} description`).toBeGreaterThanOrEqual(140)
    expect(description.length, `${path} description`).toBeLessThanOrEqual(155)
    expect(titles.has(title), `${path} duplicates the title of ${titles.get(title)}`).toBe(false)
    expect(
      descriptions.has(description),
      `${path} duplicates the description of ${descriptions.get(description)}`,
    ).toBe(false)
    titles.set(title, path)
    descriptions.set(description, path)

    expect(html.match(/<h1[\s>]/g)?.length, `${path} H1 count`).toBe(1)
    expect(html, `${path} canonical`).toContain(`<link rel="canonical" href="${ORIGIN}${path}"`)
    expect(html, `${path} open graph`).toContain('<meta property="og:title"')

    const blocks = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ].map((m) => m[1]!)
    expect(blocks.length, `${path} JSON-LD`).toBeGreaterThan(0)
    for (const block of blocks) {
      const data = JSON.parse(block) as {
        '@context': string
        '@graph': Array<Record<string, unknown>>
      }
      expect(data['@context']).toBe('https://schema.org')
      const types = data['@graph'].flatMap((n) => [n['@type']].flat()) as string[]
      for (const required of ['Organization', 'WebSite', 'BreadcrumbList'])
        expect(types, `${path} ${required}`).toContain(required)
      for (const node of data['@graph'])
        expect(node['@id'], `${path} node without @id`).toBeTruthy()
      const ids = data['@graph'].map((n) => n['@id'])
      expect(new Set(ids).size, `${path} duplicate @id`).toBe(ids.length)
    }
  }
})

test('server HTML is complete without JavaScript (no out-of-order Suspense segments)', async ({
  request,
}) => {
  // Streamed segments stay hidden until an inline script runs: invisible without JS or under a
  // strict CSP. A <Suspense> around content that suspends on the server causes this.
  for (const path of [
    '/',
    '/get-a-quote/',
    '/contact/',
    '/annual-maintenance-contract/',
    '/services/plumbing-services-dubai/',
  ]) {
    const html = await (await request.get(path)).text()
    expect(html, path).not.toMatch(/<div hidden id="S:\d+"/)
  }
})

test('service pages carry Service and FAQPage schema', async ({request}) => {
  const html = await (await request.get('/services/ac-services-dubai/')).text()
  const graph = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!,
  )['@graph'] as Array<Record<string, unknown>>
  const service = graph.find((n) => n['@type'] === 'Service')!
  expect(service).toMatchObject({name: 'AC Services', provider: {'@id': `${ORIGIN}/#organization`}})
  expect(graph.some((n) => n['@type'] === 'FAQPage')).toBe(true)
  // Prices are hidden until confirmed, so no offers in the schema either.
  expect(service.offers).toBeUndefined()
})

test('thank-you, style guide and 404 pages are noindex', async ({request}) => {
  for (const path of ['/thank-you/', '/style-guide/', '/no-such-page/']) {
    const html = await (await request.get(path)).text()
    expect(html, path).toMatch(/<meta name="robots" content="noindex/)
  }
})

test('sitemap lists indexable pages only, with absolute www URLs', async ({request}) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  expect(urls.length).toBeGreaterThan(10)
  for (const u of urls) expect(u.startsWith(`${ORIGIN}/`)).toBe(true)
  for (const p of indexable) expect(urls, p).toContain(`${ORIGIN}${p}`)
  for (const hidden of ['/thank-you/', '/style-guide/', '/privacy-policy/'])
    expect(urls).not.toContain(`${ORIGIN}${hidden}`)
})

test('robots.txt blocks everything outside production', async ({request}) => {
  const txt = await (await request.get('/robots.txt')).text()
  expect(txt).toMatch(/User-Agent: \*\s+Disallow: \//i)
})

test('old Wix URLs redirect in one hop, store pages are gone', async ({request}) => {
  const cases: Array<[string, number, string?]> = [
    ['/copy-of-ac-services', 301, '/services/electrical-services-dubai/'],
    ['/copy-of-electrical-services', 301, '/services/plumbing-services-dubai/'],
    ['/lead-collection', 301, '/annual-maintenance-contract/residential/'],
    ['/registration', 301, '/annual-maintenance-contract/commercial/'],
    ['/about-us', 301, '/about/'],
    ['/About-Us/', 301, '/about/'],
    ['/accessibility-statement', 301, '/accessibility/'],
    ['/ar/contact', 301, '/contact/'],
    ['/service-page/ac-deep-cleaning', 301, '/services/ac-services-dubai/'],
    ['/product-page/baseball-cap', 410],
    ['/contact', 308, '/contact/'],
  ]
  for (const [from, status, to] of cases) {
    const res = await request.get(from, {maxRedirects: 0})
    expect(res.status(), from).toBe(status)
    if (to) {
      const location = new URL(res.headers().location!, 'http://localhost:3100').pathname
      expect(location, from).toBe(to)
      const next = await request.get(to, {maxRedirects: 0})
      expect(next.status(), `${to} must not redirect again`).toBe(200)
    }
  }
})

test('security headers are present', async ({request}) => {
  const headers = (await request.get('/')).headers()
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['permissions-policy']).toContain('camera=()')
  expect(headers['cross-origin-opener-policy']).toBe('same-origin')
  expect(
    headers['content-security-policy-report-only'] ?? headers['content-security-policy'],
  ).toContain("frame-ancestors 'self'")
  expect(headers['x-powered-by']).toBeUndefined()
})
