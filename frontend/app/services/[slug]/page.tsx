import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {CtaBand, DirectAnswer} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {AsideCta, ContentLayout, PriceList, RelatedServices} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {
  ctaFromSections,
  faqsFromSections,
  SectionRenderer,
} from '@/components/sections/SectionRenderer'
import {JsonLd} from '@/components/seo/JsonLd'
import {getAreas, getService, getServices, getSettings, getSlugs} from '@/lib/content'
import {serviceWhatsappMessage} from '@/lib/contact'
import {contactLinks, formatDate} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {faqNode, serviceNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type Props = {params: Promise<{slug: string}>}

export const dynamicParams = true

export async function generateStaticParams() {
  return (await getSlugs('service')).map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const [service, settings] = await Promise.all([getService(slug), getSettings()])
  if (!service) return {}
  return buildMetadata({
    path: routes.service(slug),
    seo: service.seo,
    fallbackTitle: `${service.title} in Dubai | IIM Technical Services`,
    fallbackDescription: service.directAnswer?.slice(0, 150) ?? service.cardSummary ?? '',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function ServicePage({params}: Props) {
  const {slug} = await params
  const [service, settings, allServices, areas] = await Promise.all([
    getService(slug),
    getSettings(),
    getServices(),
    getAreas(),
  ])
  if (!service) notFound()

  const path = routes.service(slug)
  const url = absoluteUrl(path)
  const message = serviceWhatsappMessage(service.whatsappNoun, service.title)
  const links = contactLinks(settings, message)
  const pricesVisible = Boolean(settings.showPrices && service.showPrices)
  const faqs = faqsFromSections(service.sections)
  const cta = ctaFromSections(service.sections)
  const related = service.relatedServices?.length
    ? service.relatedServices
    : allServices.filter((s) => s._id !== service._id)
  const crumbs = [homeCrumb, {name: 'Services', href: routes.services}, {name: service.title ?? ''}]
  const reviewed = formatDate(service.lastReviewed)

  const graph = await pageGraph({
    path,
    name: service.heroHeadline ?? service.title ?? '',
    description: service.seo?.metaDescription ?? service.directAnswer,
    crumbs,
    extra: [
      serviceNode(
        url,
        {
          title: service.title ?? '',
          serviceType: service.schemaServiceType,
          description: service.directAnswer,
          areas: areas.map((a) => a.title).filter((t): t is string => Boolean(t)),
        },
        pricesVisible ? service.prices : null,
      ),
      faqNode(url, faqs),
    ],
    extraJsonLd: service.seo?.extraJsonLd,
    modified: service.lastReviewed ?? service._updatedAt,
  })

  return (
    <>
      <JsonLd data={graph} />
      <PageHero
        title={service.heroHeadline ?? service.title ?? ''}
        eyebrow={service.title}
        lead={service.heroSubhead}
        image={service.heroImage}
        crumbs={crumbs}
        actions={{quoteHref: quoteUrl(slug), whatsappHref: links.whatsapp}}
        meta={
          reviewed ? (
            <span>
              Last reviewed {reviewed}
              {service.reviewer?.name ? ` by ${service.reviewer.name}` : ''}
            </span>
          ) : null
        }
      />
      <ContentLayout
        asideLabel="Book this service"
        aside={
          <AsideCta
            quoteHref={quoteUrl(slug)}
            whatsappHref={links.whatsapp}
            telHref={links.tel}
            phoneDisplay={links.phoneDisplay}
          />
        }
      >
        <DirectAnswer text={service.directAnswer} />
        <SectionRenderer sections={service.sections} />
        <PriceList prices={service.prices} visible={pricesVisible} note={settings.priceNote} />
      </ContentLayout>
      <RelatedServices
        services={related}
        areas={areas
          .filter((a) => a.slug)
          .map((a) => ({href: routes.area(a.slug!), label: a.title ?? ''}))}
      />
      <CtaBand
        heading={cta?.heading || `Book ${service.title?.toLowerCase() ?? 'a technician'} in Dubai`}
        text={
          cta?.text ||
          'Send a photo on WhatsApp or use the quote form. We confirm the visit, and you pay after the service.'
        }
        quoteHref={quoteUrl(slug)}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}
