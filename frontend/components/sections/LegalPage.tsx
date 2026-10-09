import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {RichText} from '@/components/sections/Blocks'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Section} from '@/components/ui/Layout'
import {getPage, getReviewDraftPage, getSettings, type PageKey} from '@/lib/content'
import {formatDate} from '@/lib/page-data'
import {pageKeyRoute} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type LegalKey = Extract<PageKey, 'privacy-policy' | 'terms' | 'accessibility'>

export async function legalMetadata(key: LegalKey, fallbackTitle: string): Promise<Metadata> {
  const [published, settings] = await Promise.all([getPage(key), getSettings()])
  const page = published ?? (await getReviewDraftPage(key))
  if (!page) return {}
  return buildMetadata({
    noindex: !published,
    path: pageKeyRoute[key]!,
    seo: page.seo,
    fallbackTitle,
    fallbackDescription: fallbackTitle,
    defaultOgImage: settings.defaultOgImage,
  })
}

/**
 * Legal and simple text pages. On the live site: 404 until published (privacy and terms await
 * legal review). On review deployments the draft shows, marked as a draft, so links to it work.
 */
export async function LegalPage({pageKey}: {pageKey: LegalKey}) {
  const published = await getPage(pageKey)
  const page = published ?? (await getReviewDraftPage(pageKey))
  if (!page) notFound()
  const draft = !published
  const path = pageKeyRoute[pageKey]!
  const title = page.heroHeadline ?? page.title ?? ''
  const crumbs = [homeCrumb, {name: title}]
  const updated = formatDate(page.lastReviewed ?? page._updatedAt)
  return (
    <>
      <JsonLd data={await pageGraph({path, name: title, crumbs, modified: page._updatedAt})} />
      <PageHero
        title={title}
        crumbs={crumbs}
        meta={updated ? <span>Last updated {updated}</span> : null}
      />
      <Section>
        {draft ? (
          <p className="mb-6 max-w-prose rounded-sm border-2 border-ink-900 bg-cream p-4 font-semibold">
            Draft for review: this text is awaiting legal review and is not yet published on the
            live site.
          </p>
        ) : null}
        <RichText value={page.body} />
      </Section>
    </>
  )
}
