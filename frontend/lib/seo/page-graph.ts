import {getAreas, getServices, getSettings} from '@/lib/content'
import {routes} from '@/lib/routes'

import {absoluteUrl} from './metadata'
import {buildGraph, businessNode, parseExtraJsonLd, type Crumb} from './jsonld'

type Node = Record<string, unknown>

/** Builds the page's full JSON-LD graph with the business node from siteSettings. */
export async function pageGraph({
  path,
  name,
  description,
  crumbs,
  extra = [],
  extraJsonLd,
  modified,
  pageType,
  ratingVisible = false,
}: {
  path: string
  name: string
  description?: string | null
  crumbs: Crumb[]
  extra?: Array<Node | null | undefined>
  extraJsonLd?: string | null
  modified?: string | null
  pageType?: Parameters<typeof buildGraph>[0]['pageType']
  ratingVisible?: boolean
}) {
  const [settings, services, areas] = await Promise.all([getSettings(), getServices(), getAreas()])
  const business = businessNode(settings, {
    areas: areas.map((a) => a.title).filter((t): t is string => Boolean(t)),
    services: services
      .filter((s) => s.slug && s.title)
      .map((s) => ({title: s.title!, url: absoluteUrl(routes.service(s.slug!))})),
    ratingVisible,
  })
  return buildGraph({
    path,
    name,
    description,
    business,
    crumbs,
    extra: [...extra, ...parseExtraJsonLd(extraJsonLd)],
    modified,
    pageType,
  })
}

export const homeCrumb: Crumb = {name: 'Home', href: routes.home}
