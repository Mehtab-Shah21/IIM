import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {ContentBlock, DirectAnswer, FaqList, RichText} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {AsideCta, ChipLinks, ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {getGuide, getSettings, getSlugs} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks, formatDate} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {sanityImage} from '@/lib/sanity/image'
import {articleNode, faqNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type Props = {params: Promise<{slug: string}>}

export async function generateStaticParams() {
  return (await getSlugs('guide')).map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const [guide, settings] = await Promise.all([getGuide(slug), getSettings()])
  if (!guide) return {}
  return buildMetadata({
    path: routes.guide(slug),
    seo: guide.seo,
    fallbackTitle: `${guide.title} | IIM Guides`,
    fallbackDescription: guide.excerpt ?? guide.directAnswer?.slice(0, 150) ?? '',
    defaultOgImage: guide.coverImage ?? settings.defaultOgImage,
    type: 'article',
  })
}

export default async function GuidePage({params}: Props) {
  const {slug} = await params
  const [guide, settings] = await Promise.all([getGuide(slug), getSettings()])
  if (!guide) notFound()

  const path = routes.guide(slug)
  const url = absoluteUrl(path)
  const firstService = guide.relatedServices?.[0]
  const message = defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'Guides', href: routes.guides}, {name: guide.title ?? ''}]
  const reviewed = formatDate(guide.lastReviewed)
  const published = formatDate(guide.publishedAt)
  const cover = sanityImage(guide.coverImage)

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path,
          name: guide.title ?? '',
          description: guide.excerpt ?? guide.directAnswer,
          crumbs,
          extra: [
            articleNode(url, {
              title: guide.title ?? '',
              description: guide.excerpt ?? guide.directAnswer,
              author: guide.author?.name,
              reviewer: guide.reviewer?.name,
              published: guide.publishedAt,
              modified: guide.lastReviewed,
              image: cover?.src,
            }),
            faqNode(url, guide.faqs ?? []),
          ],
          extraJsonLd: guide.seo?.extraJsonLd,
          modified: guide.lastReviewed ?? guide._updatedAt,
        })}
      />
      <PageHero
        title={guide.title ?? ''}
        eyebrow="Guide"
        crumbs={crumbs}
        meta={
          <>
            {guide.author?.name ? <span>Written by {guide.author.name}</span> : null}
            {guide.reviewer?.name ? (
              <span>
                Reviewed by {guide.reviewer.name}
                {guide.reviewer.credentials ? ` (${guide.reviewer.credentials})` : ''}
              </span>
            ) : null}
            {published ? <span>Published {published}</span> : null}
            {reviewed ? <span>Last reviewed {reviewed}</span> : null}
          </>
        }
      />
      <ContentLayout
        asideLabel="Book a technician"
        aside={
          <AsideCta
            quoteHref={quoteUrl(firstService?.slug ?? undefined)}
            whatsappHref={links.whatsapp}
            telHref={links.tel}
            phoneDisplay={links.phoneDisplay}
          />
        }
      >
        <DirectAnswer text={guide.directAnswer} />
        <RichText value={guide.body} />
        {guide.faqs?.length ? (
          <ContentBlock id="guide-faq" heading="Questions and answers">
            <FaqList items={guide.faqs} />
          </ContentBlock>
        ) : null}
        {guide.relatedServices?.length ? (
          <ContentBlock id="guide-services" heading="Need a hand with this?">
            <ChipLinks
              items={guide.relatedServices
                .filter((s) => s.slug)
                .map((s) => ({href: routes.service(s.slug!), label: s.title ?? ''}))}
              icon="wrench"
            />
          </ContentBlock>
        ) : null}
      </ContentLayout>
      <ContactDock message={message} />
    </>
  )
}
