import {readFileSync} from 'node:fs'

import {describe, expect, it} from 'vitest'

import {buildRedirectMap, matchRedirect, normalisePath} from '@/lib/redirects/matcher'

describe('normalisePath', () => {
  it.each([
    ['/About-Us/', '/about-us'],
    ['/about-us', '/about-us'],
    ['/', '/'],
    ['//services//', '/services'],
    ['/a?x=1#y', '/a'],
  ])('%s -> %s', (raw, out) => expect(normalisePath(raw)).toBe(out))
})

describe('buildRedirectMap', () => {
  it('matches exact paths case-insensitively, with or without a slash', () => {
    const map = buildRedirectMap([{from: '/about-us', to: '/about/', type: '301'}])
    expect(matchRedirect(map, '/About-Us/')).toEqual({status: 301, to: '/about/'})
    expect(matchRedirect(map, '/about-us')).toEqual({status: 301, to: '/about/'})
    expect(matchRedirect(map, '/about')).toBeNull()
  })

  it('collapses chains into one hop', () => {
    const map = buildRedirectMap([
      {from: '/a', to: '/b/', type: '301'},
      {from: '/b', to: '/c/', type: '301'},
    ])
    expect(matchRedirect(map, '/a')).toEqual({status: 301, to: '/c/'})
    expect(map.problems.some((p) => p.includes('chain'))).toBe(true)
  })

  it('skips loops and reports them', () => {
    const map = buildRedirectMap([
      {from: '/x', to: '/y/', type: '301'},
      {from: '/y', to: '/x/', type: '301'},
      {from: '/self', to: '/self/', type: '301'},
    ])
    expect(matchRedirect(map, '/x')).toBeNull()
    expect(matchRedirect(map, '/self')).toBeNull()
    expect(map.problems.filter((p) => p.includes('loop'))).toHaveLength(3)
  })

  it('supports 410 and prefix wildcards (longest prefix wins)', () => {
    const map = buildRedirectMap([
      {from: '/product-page/*', type: '410'},
      {from: '/old/*', to: '/services/', type: '301'},
      {from: '/old/special/*', to: '/about/', type: '301'},
    ])
    expect(matchRedirect(map, '/product-page/cap')).toEqual({status: 410})
    expect(matchRedirect(map, '/old/anything')).toEqual({status: 301, to: '/services/'})
    expect(matchRedirect(map, '/old/special/x')).toEqual({status: 301, to: '/about/'})
  })

  it('keeps external targets and ignores rules without a target', () => {
    const map = buildRedirectMap([
      {from: '/maps', to: 'https://maps.example.com/iim', type: '302'},
      {from: '/broken', type: '301'},
    ])
    expect(matchRedirect(map, '/maps')).toEqual({status: 302, to: 'https://maps.example.com/iim'})
    expect(matchRedirect(map, '/broken')).toBeNull()
  })
})

describe('seeded redirect map (old Wix URLs)', () => {
  const docs = JSON.parse(
    readFileSync(new URL('../../content/seed/documents.json', import.meta.url), 'utf8'),
  ) as Array<{
    _type: string
    from?: string
    to?: string
    type?: string
  }>
  const rules = docs.filter((d) => d._type === 'redirect')
  const map = buildRedirectMap(rules)

  it('has no loops, chains or duplicates', () => expect(map.problems).toEqual([]))

  it.each([
    ['/copy-of-ac-services', '/services/electrical-services-dubai/'],
    ['/copy-of-electrical-services', '/services/plumbing-services-dubai/'],
    ['/copy-of-plumbing-services', '/services/painting-services-dubai/'],
    ['/copy-of-painting-services', '/services/handyman-services-dubai/'],
    ['/copy-of-handyman-services', '/services/emergency-electrician-plumber-dubai/'],
    ['/lead-collection', '/annual-maintenance-contract/residential/'],
    ['/registration', '/annual-maintenance-contract/commercial/'],
    ['/about-us', '/about/'],
    ['/accessibility-statement', '/accessibility/'],
    ['/services-4-1', '/services/ac-services-dubai/'],
    ['/ar/copy-of-plumbing-services', '/services/painting-services-dubai/'],
  ])('%s -> %s', (from, to) => expect(matchRedirect(map, from)).toEqual({status: 301, to}))

  it('returns 410 for the Wix demo store', () => {
    expect(matchRedirect(map, '/product-page/baseball-cap')).toEqual({status: 410})
  })

  it('only sends copies of the old homepage to the home page', () => {
    const toHome = rules
      .filter((r) => r.to === '/')
      .map((r) => r.from)
      .sort()
    expect(toHome).toEqual(['/ar', '/ar/coming-soon-01', '/coming-soon-01'])
  })
})
