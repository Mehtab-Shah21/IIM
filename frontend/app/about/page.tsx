import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {Icon, type IconName} from '@/components/icons/Icon'
import {addressLine} from '@/components/layout/Footer'
import {CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {SectionRenderer} from '@/components/sections/SectionRenderer'
import {JsonLd} from '@/components/seo/JsonLd'
import {getPage, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()])
  return buildMetadata({
    path: routes.about,
    seo: page?.seo,
    fallbackTitle: 'About IIM Technical Services | Dubai Maintenance Team',
    fallbackDescription: 'Meet the team behind IIM Technical Services and how we look after homes and businesses across Dubai.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()])
  if (!page) notFound()
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'About'}]

  // Only confirmed details: each row appears once its field is filled in Sanity.
  const details: Array<[IconName, string]> = [
    ['building-2', settings.legalName || settings.businessName || ''],
    ...(settings.licenceNumber
      ? [['badge-check', `Trade licence ${settings.licenceNumber}${settings.licenceAuthority ? `, ${settings.licenceAuthority}` : ''}`] as [IconName, string]]
      : []),
    ...(settings.dewaShow && settings.dewaText ? [['shield-check', settings.dewaText] as [IconName, string]] : []),
    ...(settings.insuranceText ? [['shield-check', settings.insuranceText] as [IconName, string]] : []),
    ['map-pin', addressLine(settings)],
  ]

  return (
    <>
      <JsonLd data={await pageGraph({path: routes.about, name: page.heroHeadline ?? 'About', description: page.seo?.metaDescription, crumbs, extraJsonLd: page.seo?.extraJsonLd, modified: page._updatedAt, pageType: 'AboutPage'})} />
      <PageHero title={page.heroHeadline ?? 'About IIM Technical Services'} eyebrow="About IIM" lead={page.heroSubhead} crumbs={crumbs} />
      <ContentLayout
        asideLabel="Company details"
        aside={
          <div className="grid gap-4 rounded-md border border-neutral-200 bg-white p-card shadow-md">
            <h2 className="text-h3 font-bold">Company details</h2>
            <ul className="m-0 grid list-none gap-4 p-0">
              {details
                .filter(([, text]) => text)
                .map(([icon, text]) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="inline-grid size-icon-tile shrink-0 place-items-center rounded-sm bg-ink-900 text-accent">
                      <Icon name={icon} />
                    </span>
                    <span className="self-center">{text}</span>
                  </li>
                ))}
            </ul>
          </div>
        }
      >
        <SectionRenderer sections={page.sections} />
      </ContentLayout>
      <CtaBand heading="Work with us" text="Tell us what needs doing. We confirm a time, do the job and you pay after the service." quoteHref={quoteUrl()} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />
      <ContactDock message={message} />
    </>
  )
}
