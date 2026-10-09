import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {CtaBand, DirectAnswer} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {AsideCta, ChipLinks, ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {faqsFromSections, SectionRenderer} from '@/components/sections/SectionRenderer'
import {JsonLd} from '@/components/seo/JsonLd'
import {getArea, getServices, getSettings, getSlugs} from '@/lib/content'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {faqNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type Props = {params: Promise<{slug: string}>}

export async function generateStaticParams() {
  return (await getSlugs('area')).map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const [area, settings] = await Promise.all([getArea(slug), getSettings()])
  if (!area) return {}
  return buildMetadata({
    path: routes.area(slug),
    seo: area.seo,
    fallbackTitle: `Electrician & Plumber in ${area.title}, Dubai | IIM`,
    fallbackDescription: area.directAnswer?.slice(0, 150) ?? `Electrical, plumbing and maintenance services in ${area.title}, Dubai.`,
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function AreaPage({params}: Props) {
  const {slug} = await params
  const [area, settings, allServices] = await Promise.all([getArea(slug), getSettings(), getServices()])
  if (!area) notFound()

  const path = routes.area(slug)
  const message = `Hi IIM, I need a technician in ${area.title}.`
  const links = contactLinks(settings, message)
  const services = area.services?.length ? area.services : allServices
  const crumbs = [homeCrumb, {name: 'Areas', href: routes.areas}, {name: area.title ?? ''}]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path,
          name: area.heroHeadline ?? area.title ?? '',
          description: area.seo?.metaDescription ?? area.directAnswer,
          crumbs,
          extra: [faqNode(absoluteUrl(path), faqsFromSections(area.sections))],
          extraJsonLd: area.seo?.extraJsonLd,
          modified: area.lastReviewed ?? area._updatedAt,
        })}
      />
      <PageHero
        title={area.heroHeadline ?? `Electrician and plumber in ${area.title}, Dubai`}
        eyebrow={area.title}
        lead={area.heroSubhead}
        crumbs={crumbs}
        actions={{quoteHref: quoteUrl(), whatsappHref: links.whatsapp}}
      />
      <ContentLayout asideLabel="Book a visit" aside={<AsideCta quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />}>
        <DirectAnswer text={area.directAnswer} />
        <SectionRenderer sections={area.sections} />
        <section className="grid gap-4" aria-labelledby="area-services">
          <h2 id="area-services" className="text-h2 font-bold">
            Services in {area.title}
          </h2>
          <ChipLinks items={services.filter((s) => s.slug).map((s) => ({href: routes.service(s.slug!), label: s.title ?? ''}))} icon="wrench" />
        </section>
      </ContentLayout>
      <CtaBand heading={`Need a technician in ${area.title}?`} quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />
      <ContactDock message={message} />
    </>
  )
}
