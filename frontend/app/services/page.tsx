import type {Metadata} from 'next'

import {CtaBand, ServiceGrid} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {EmergencyBand} from '@/components/sections/HomeSections'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {ButtonLink} from '@/components/ui/Button'
import {Section, SectionHeader} from '@/components/ui/Layout'
import {getPage, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('services'), getSettings()])
  return buildMetadata({
    path: routes.services,
    seo: page?.seo,
    fallbackTitle: 'Home Maintenance & Repair Services in Dubai | IIM',
    fallbackDescription: 'Electrical, plumbing, AC, painting, handyman and renovation services for Dubai homes and businesses. Fast booking, pay after the service.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function ServicesHub() {
  const [page, settings, services] = await Promise.all([getPage('services'), getSettings(), getServices()])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const emergency = services.find((s) => s.isEmergency)
  const title = page?.heroHeadline ?? 'Home maintenance and repair services in Dubai'
  const crumbs = [homeCrumb, {name: 'Services'}]

  return (
    <>
      <JsonLd
        data={await pageGraph({path: routes.services, name: title, description: page?.seo?.metaDescription, crumbs, extraJsonLd: page?.seo?.extraJsonLd, modified: page?._updatedAt, pageType: 'CollectionPage'})}
      />
      <PageHero title={title} eyebrow="Services" lead={page?.heroSubhead} crumbs={crumbs} actions={{quoteHref: quoteUrl(), whatsappHref: links.whatsapp}} />
      <Section labelledBy="all-services">
        <h2 id="all-services" className="sr-only">
          All services
        </h2>
        <ServiceGrid services={services.filter((s) => s !== emergency)} />
        {emergency ? <EmergencyBand service={emergency} telHref={links.tel} whatsappHref={links.whatsapp} /> : null}
      </Section>
      <Section surface="cream" labelledBy="amc-band">
        <div className="grid items-center gap-7 lg:grid-cols-2">
          <SectionHeader id="amc-band" eyebrow="Prefer a yearly plan?" title="Annual maintenance contracts" lead="Regular check-ups for every system in your property, with priority visits when something fails." />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={routes.amcResidential} variant="primary">
              Residential plans
            </ButtonLink>
            <ButtonLink href={routes.amcCommercial} variant="secondary">
              Commercial plans
            </ButtonLink>
          </div>
        </div>
      </Section>
      <CtaBand heading="Not sure which service you need?" text="Send a photo of the problem on WhatsApp and we will tell you." quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />
      <ContactDock message={message} />
    </>
  )
}
