import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {AmcForm} from '@/components/forms/AmcForm'
import {DirectAnswer} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {faqsFromSections, SectionRenderer} from '@/components/sections/SectionRenderer'
import {JsonLd} from '@/components/seo/JsonLd'
import {Card} from '@/components/ui/Card'
import {Section, SectionHeader} from '@/components/ui/Layout'
import {getAmcPlans, getPage, getSettings, type PageKey} from '@/lib/content'
import {contactLinks, turnstileSiteKey} from '@/lib/page-data'
import {pageKeyRoute, routes} from '@/lib/routes'
import {faqNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

const message = 'Hi IIM, I would like to know more about your annual maintenance contract.'

export async function amcMetadata(
  key: PageKey,
  fallbackTitle: string,
  fallbackDescription: string,
): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(key), getSettings()])
  return buildMetadata({
    path: pageKeyRoute[key]!,
    seo: page?.seo,
    fallbackTitle,
    fallbackDescription,
    defaultOgImage: settings.defaultOgImage,
  })
}

function ApplyPanel({plan, title}: {plan?: 'residential' | 'commercial'; title: string}) {
  return (
    <div
      id="apply"
      className="rounded-md border border-neutral-200 bg-white p-card shadow-md md:p-6"
    >
      <h2 className="mb-2 text-h3 font-bold">{title}</h2>
      <p className="mb-5 text-neutral-600">
        We call you back to agree the visit schedule and coverage before anything is signed.
      </p>
      <AmcForm idPrefix={plan ? `amc-${plan}` : 'amc-hub'} plan={plan} siteKey={turnstileSiteKey} />
    </div>
  )
}

export async function AmcHubPage() {
  const [page, settings, plans] = await Promise.all([getPage('amc'), getSettings(), getAmcPlans()])
  if (!page) notFound()
  const links = contactLinks(settings, message)
  const path = routes.amc
  const crumbs = [homeCrumb, {name: 'Annual Maintenance Contract'}]
  return (
    <>
      <JsonLd
        data={await pageGraph({
          path,
          name: page.heroHeadline ?? page.title ?? '',
          description: page.seo?.metaDescription,
          crumbs,
          extra: [faqNode(absoluteUrl(path), faqsFromSections(page.sections))],
          extraJsonLd: page.seo?.extraJsonLd,
          modified: page._updatedAt,
        })}
      />
      <PageHero
        title={page.heroHeadline ?? 'Annual Maintenance Contracts in Dubai'}
        eyebrow="Annual Maintenance Contract"
        lead={page.heroSubhead}
        crumbs={crumbs}
        actions={{quoteHref: '#apply', quoteLabel: 'Apply now', whatsappHref: links.whatsapp}}
      />
      <Section labelledBy="plans-title">
        <div className="mb-7">
          <DirectAnswer text={page.directAnswer} />
        </div>
        <SectionHeader id="plans-title" title="Choose your plan" />
        <div className="grid items-stretch gap-gap md:grid-cols-2">
          {plans.map((p) => (
            <Card
              key={p.key}
              href={pageKeyRoute[p.key ?? ''] ?? routes.amc}
              title={p.title ?? ''}
              text={p.cardSummary}
              icon={p.key === 'amc-commercial' ? 'building-2' : 'house'}
              cta="See what is included"
              headingLevel={3}
            />
          ))}
        </div>
      </Section>
      <ContentLayout
        aside={<ApplyPanel title="Apply for a contract" />}
        asideLabel="Apply for a contract"
      >
        <SectionRenderer sections={page.sections} />
      </ContentLayout>
      <ContactDock message={message} />
    </>
  )
}

export async function AmcPlanPage({
  pageKey,
  plan,
}: {
  pageKey: 'amc-residential' | 'amc-commercial'
  plan: 'residential' | 'commercial'
}) {
  const [page, settings] = await Promise.all([getPage(pageKey), getSettings()])
  if (!page) notFound()
  const links = contactLinks(settings, message)
  const path = pageKeyRoute[pageKey]!
  const crumbs = [
    homeCrumb,
    {name: 'Annual Maintenance Contract', href: routes.amc},
    {name: plan === 'residential' ? 'Residential' : 'Commercial'},
  ]
  return (
    <>
      <JsonLd
        data={await pageGraph({
          path,
          name: page.heroHeadline ?? page.title ?? '',
          description: page.seo?.metaDescription,
          crumbs,
          extra: [faqNode(absoluteUrl(path), faqsFromSections(page.sections))],
          extraJsonLd: page.seo?.extraJsonLd,
          modified: page._updatedAt,
        })}
      />
      <PageHero
        title={page.heroHeadline ?? page.title ?? ''}
        eyebrow="Annual Maintenance Contract"
        lead={page.heroSubhead}
        crumbs={crumbs}
        actions={{quoteHref: '#apply', quoteLabel: 'Apply now', whatsappHref: links.whatsapp}}
      />
      <ContentLayout
        aside={<ApplyPanel plan={plan} title="Apply for this plan" />}
        asideLabel="Apply for this plan"
      >
        <DirectAnswer text={page.directAnswer} />
        <SectionRenderer sections={page.sections} />
      </ContentLayout>
      <ContactDock message={message} />
    </>
  )
}
