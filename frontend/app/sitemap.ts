import type {MetadataRoute} from 'next'

import {getSitemapData} from '@/lib/content'
import {pageKeyRoute, routes} from '@/lib/routes'
import {absoluteUrl} from '@/lib/seo/metadata'

/** Indexable pages only, with lastModified from the CMS. Revalidated with the content. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData()
  const excluded = new Set(['thank-you'])
  const entries: MetadataRoute.Sitemap = []

  for (const p of data.pages ?? []) {
    if (!p.key || p.noindex || excluded.has(p.key) || !pageKeyRoute[p.key]) continue
    entries.push({url: absoluteUrl(pageKeyRoute[p.key]!), lastModified: p._updatedAt, priority: p.key === 'home' ? 1 : 0.7})
  }
  const typed: Array<[keyof typeof data, (slug: string) => string, number]> = [
    ['services', routes.service, 0.9],
    ['areas', routes.area, 0.8],
    ['projects', routes.project, 0.5],
    ['guides', routes.guide, 0.6],
  ]
  for (const [key, toPath, priority] of typed) {
    const list = data[key] as Array<{slug: string | null; _updatedAt: string; noindex: boolean | null}> | null
    for (const d of list ?? []) {
      if (!d.slug || d.noindex) continue
      entries.push({url: absoluteUrl(toPath(d.slug)), lastModified: d._updatedAt, priority})
    }
  }
  // Hubs that are noindex while empty (see each hub's metadata) are left out.
  const has = (k: keyof typeof data) => ((data[k] as unknown[] | null) ?? []).length > 0
  return entries.filter(
    (e) =>
      !(e.url === absoluteUrl(routes.areas) && !has('areas')) &&
      !(e.url === absoluteUrl(routes.projects) && !has('projects')) &&
      !(e.url === absoluteUrl(routes.guides) && !has('guides')),
  )
}
