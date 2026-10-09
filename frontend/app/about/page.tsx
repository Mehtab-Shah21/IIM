import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Fragment} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'
import {addressLine} from '@/components/layout/Footer'
import {CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {SectionRenderer} from '@/components/sections/SectionRenderer'
import {CursorCard} from '@/components/ui/CursorCard'
import {JsonLd} from '@/components/seo/JsonLd'
import {getPage, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {sanityImage} from '@/lib/sanity/image'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()])
  return buildMetadata({
    path: routes.about,
    seo: page?.seo,
    fallbackTitle: 'About IIM Technical Services | Dubai Maintenance Team',
    fallbackDescription:
      'Meet the team behind IIM Technical Services and how we look after homes and businesses across Dubai.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function AboutPage() {
  const [page, settings, allServices] = await Promise.all([
    getPage('about'),
    getSettings(),
    getServices(),
  ])
  if (!page) notFound()
  // Trades only: emergency repairs is a way of booking, not a kind of work.
  const services = allServices.filter((s) => s.slug && !s.isEmergency)
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'About'}]

  // Only confirmed details: each row appears once its field is filled in Sanity.
  const details: Array<[IconName, string]> = [
    ['building-2', settings.legalName || settings.businessName || ''],
    ...(settings.licenceNumber
      ? [
          [
            'badge-check',
            `Trade licence ${settings.licenceNumber}${settings.licenceAuthority ? `, ${settings.licenceAuthority}` : ''}`,
          ] as [IconName, string],
        ]
      : []),
    ...(settings.dewaShow && settings.dewaText
      ? [['shield-check', settings.dewaText] as [IconName, string]]
      : []),
    ...(settings.insuranceText
      ? [['shield-check', settings.insuranceText] as [IconName, string]]
      : []),
    ['map-pin', addressLine(settings)],
  ]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.about,
          name: page.heroHeadline ?? 'About',
          description: page.seo?.metaDescription,
          crumbs,
          extraJsonLd: page.seo?.extraJsonLd,
          modified: page._updatedAt,
          pageType: 'AboutPage',
        })}
      />
      <PageHero
        title={page.heroHeadline ?? 'About IIM Technical Services'}
        eyebrow="About IIM"
        lead={page.heroSubhead}
        image={page.heroImage}
        crumbs={crumbs}
      />
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
        {services.length ? (
          <section aria-labelledby="about-services" className="mt-8 grid gap-4">
            <h2 id="about-services" className="text-h2 font-bold">
              What we cover
            </h2>
            <p className="max-w-prose text-lead">
              {services.map((s, i) => (
                <Fragment key={s._id}>
                  {i > 0 ? (i === services.length - 1 ? ' and ' : ', ') : 'We handle '}
                  <CursorCard
                    href={routes.service(s.slug!)}
                    image={sanityImage(s.cardImage)}
                    description={s.cardSummary ?? ''}
                  >
                    {tradeName(s.title)}
                  </CursorCard>
                </Fragment>
              ))}{' '}
              work for homes and businesses across Dubai. Each service page explains what is
              included and how booking works.
            </p>
          </section>
        ) : null}
      </ContentLayout>
      <CtaBand
        heading="Work with us"
        text="Tell us what needs doing. We confirm a time, do the job and you pay after the service."
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}

/** "AC Services" -> "AC", "Home Renovation" -> "home renovation" (acronyms keep their capitals). */
function tradeName(title: string | null | undefined): string {
  return (title ?? '')
    .replace(/ Services$/, '')
    .split(' ')
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(' ')
}
