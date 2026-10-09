import type {Metadata} from 'next'
import Image from 'next/image'

import {CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Card, PhotoPlaceholder} from '@/components/ui/Card'
import {Section} from '@/components/ui/Layout'
import {getGuides, getPage, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {sanityImage} from '@/lib/sanity/image'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, guides] = await Promise.all([getPage('guides'), getSettings(), getGuides()])
  return buildMetadata({
    path: routes.guides,
    seo: page?.seo,
    fallbackTitle: 'Home Maintenance Guides for Dubai Homes | IIM',
    fallbackDescription: 'Practical, expert advice on electrical safety, plumbing problems and keeping your property in good shape.',
    noindex: guides.length === 0,
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function GuidesHub() {
  const [page, settings, guides] = await Promise.all([getPage('guides'), getSettings(), getGuides()])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const title = page?.heroHeadline ?? 'Home maintenance guides for Dubai homes'
  const crumbs = [homeCrumb, {name: 'Guides'}]

  return (
    <>
      <JsonLd data={await pageGraph({path: routes.guides, name: title, crumbs, modified: page?._updatedAt, pageType: 'CollectionPage'})} />
      <PageHero title={title} eyebrow="Guides" lead={page?.heroSubhead} crumbs={crumbs} />
      <Section labelledBy="guides-list">
        <h2 id="guides-list" className="sr-only">
          Guides
        </h2>
        {guides.length ? (
          <div className="grid items-stretch gap-gap md:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => {
              const img = sanityImage(g.coverImage)
              return (
                <Card
                  key={g._id}
                  href={routes.guide(g.slug ?? '')}
                  title={g.title ?? ''}
                  text={g.excerpt}
                  cta="Read the guide"
                  media={
                    img ? (
                      <Image src={img.src} alt="" width={800} height={500} sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw" className="size-full object-cover" />
                    ) : (
                      <PhotoPlaceholder />
                    )
                  }
                />
              )
            })}
          </div>
        ) : (
          <p className="max-w-prose text-lead">Our first guides are being written by the team.</p>
        )}
      </Section>
      <CtaBand heading="Rather have an expert look at it?" quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />
      <ContactDock message={message} />
    </>
  )
}
