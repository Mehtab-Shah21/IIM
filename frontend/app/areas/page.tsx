import type {Metadata} from 'next'

import {CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Card} from '@/components/ui/Card'
import {Chip, Section} from '@/components/ui/Layout'
import {getAreas, getPage, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, areas] = await Promise.all([getPage('areas'), getSettings(), getAreas()])
  return buildMetadata({
    // Thin until real area pages exist (PLACEHOLDERS A16).
    noindex: areas.length === 0,
    path: routes.areas,
    seo: page?.seo,
    fallbackTitle: 'Areas We Serve in Dubai | IIM Technical Services',
    fallbackDescription: 'See the Dubai communities where IIM provides electrical, plumbing and maintenance services, and book a visit in three simple steps.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function AreasHub() {
  const [page, settings, areas] = await Promise.all([getPage('areas'), getSettings(), getAreas()])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const title = page?.heroHeadline ?? 'Areas we serve in Dubai'
  const crumbs = [homeCrumb, {name: 'Areas'}]
  const names = settings.serviceAreas ?? []

  return (
    <>
      <JsonLd data={await pageGraph({path: routes.areas, name: title, description: page?.seo?.metaDescription, crumbs, modified: page?._updatedAt, pageType: 'CollectionPage'})} />
      <PageHero title={title} eyebrow="Areas" lead={page?.heroSubhead} crumbs={crumbs} actions={{quoteHref: quoteUrl(), whatsappHref: links.whatsapp}} />
      <Section labelledBy="areas-list">
        <h2 id="areas-list" className="sr-only">
          Service areas
        </h2>
        {areas.length ? (
          <div className="grid items-stretch gap-gap md:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <Card key={a._id} href={routes.area(a.slug ?? '')} title={a.title ?? ''} text={a.cardSummary} icon="map-pin" cta="Services in this area" />
            ))}
          </div>
        ) : (
          <div className="grid max-w-prose gap-5">
            <p className="text-lead">We work across Dubai. Send your location when you book and we will confirm the visit time.</p>
            {names.length ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Communities we visit">
                {names.map((n) => (
                  <li key={n}>
                    <Chip>{n}</Chip>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </Section>
      <CtaBand heading="Is your area covered?" text="Message us with your location and we will confirm when a technician can visit." quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />
      <ContactDock message={message} />
    </>
  )
}
