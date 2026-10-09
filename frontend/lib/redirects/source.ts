/**
 * Routing data for the proxy, cached in memory for 60 seconds so edits in Sanity are live
 * within a minute (at most one CDN request a minute):
 * - redirect rules (lib/redirects/matcher.ts)
 * - which fixed pages and slugs exist, so unknown ones become routing-level 404s. Next.js 16
 *   only server-renders the 404 page for unmatched routes; a notFound() thrown inside a page is
 *   rendered on the client, which would leave no-JS visitors and crawlers with a blank page.
 */
import {isSanityConfigured} from '@/lib/env'
import {routingQuery} from '@/lib/sanity/queries'

import {buildRedirectMap, type RedirectMap, type RedirectRule} from './matcher'

export type RoutingData = {
  redirects: RedirectMap
  pages: Set<string>
  slugs: Record<'service' | 'area' | 'project' | 'guide', Set<string>>
}

type Raw = {
  redirects: RedirectRule[] | null
  pages: string[] | null
  service: string[] | null
  area: string[] | null
  project: string[] | null
  guide: string[] | null
}

const TTL_MS = 60_000
let cache: {at: number; data: RoutingData} | null = null
let inflight: Promise<RoutingData | null> | null = null

async function load(): Promise<Raw> {
  if (isSanityConfigured) {
    const {makeClient} = await import('@/lib/sanity/client')
    return makeClient().fetch<Raw>(routingQuery, {}, {cache: 'no-store'})
  }
  const {evaluateFixture} = await import('@/lib/sanity/fixtures')
  return evaluateFixture<Raw>(routingQuery)
}

function build(raw: Raw): RoutingData {
  return {
    redirects: buildRedirectMap(raw.redirects ?? []),
    pages: new Set(raw.pages ?? []),
    slugs: {
      service: new Set(raw.service ?? []),
      area: new Set(raw.area ?? []),
      project: new Set(raw.project ?? []),
      guide: new Set(raw.guide ?? []),
    },
  }
}

export async function getRoutingData(now = Date.now()): Promise<RoutingData | null> {
  if (cache && now - cache.at < TTL_MS) return cache.data
  inflight ??= load()
    .then((raw) => {
      const data = build(raw)
      for (const p of data.redirects.problems)
        console.warn(JSON.stringify({event: 'redirect_rule', problem: p}))
      cache = {at: Date.now(), data}
      return data
    })
    .catch((err: unknown) => {
      console.error(
        JSON.stringify({
          event: 'routing_load_failed',
          error: err instanceof Error ? err.message : 'unknown',
        }),
      )
      // Never block the site: keep the last good data, or skip routing checks entirely.
      return cache?.data ?? null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** Paths whose existence depends on content, mapped to what must exist. */
const fixedPageKeys: Record<string, string> = {
  '/privacy-policy': 'privacy-policy',
  '/terms': 'terms',
  '/accessibility': 'accessibility',
  '/annual-maintenance-contract': 'amc',
  '/annual-maintenance-contract/residential': 'amc-residential',
  '/annual-maintenance-contract/commercial': 'amc-commercial',
  '/about': 'about',
}

/** True when the path is a content route whose document does not exist (or is unpublished). */
export function isMissingContent(data: RoutingData, normalisedPath: string): boolean {
  const key = fixedPageKeys[normalisedPath]
  if (key) return !data.pages.has(key)
  const m = /^\/(services|areas|projects|guides)\/([^/]+)$/.exec(normalisedPath)
  if (!m) return false
  const type = (
    {services: 'service', areas: 'area', projects: 'project', guides: 'guide'} as const
  )[m[1] as 'services' | 'areas' | 'projects' | 'guides']
  return !data.slugs[type].has(m[2]!)
}
