import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {RichText} from '@/components/sections/Blocks'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Section} from '@/components/ui/Layout'
import {getPage, getSettings, type PageKey} from '@/lib/content'
import {formatDate} from '@/lib/page-data'
import {pageKeyRoute} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type LegalKey = Extract<PageKey, 'privacy-policy' | 'terms' | 'accessibility'>

export async function legalMetadata(key: LegalKey, fallbackTitle: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(key), getSettings()])
  if (!page) return {}
  return buildMetadata({
    path: pageKeyRoute[key]!,
    seo: page.seo,
    fallbackTitle,
    fallbackDescription: fallbackTitle,
    defaultOgImage: settings.defaultOgImage,
  })
}

/** Legal and simple text pages. 404 until the page is published (privacy/terms await legal review). */
export async function LegalPage({pageKey}: {pageKey: LegalKey}) {
  const page = await getPage(pageKey)
  if (!page) notFound()
  const path = pageKeyRoute[pageKey]!
  const title = page.heroHeadline ?? page.title ?? ''
  const crumbs = [homeCrumb, {name: title}]
  const updated = formatDate(page.lastReviewed ?? page._updatedAt)
  return (
    <>
      <JsonLd data={await pageGraph({path, name: title, crumbs, modified: page._updatedAt})} />
      <PageHero title={title} crumbs={crumbs} meta={updated ? <span>Last updated {updated}</span> : null} />
      <Section>
        <RichText value={page.body} />
      </Section>
    </>
  )
}
