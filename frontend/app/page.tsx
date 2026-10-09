import type {Metadata} from 'next'

import {AmcForm} from '@/components/forms/AmcForm'
import {
  ArrowLink,
  BeforeAfter,
  Checklist,
  CtaBand,
  FaqList,
  ProofPoints,
  ServiceGrid,
  Steps,
} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {
  EmergencyBand,
  HomeHero,
  RatingSummary,
  Stats,
  Testimonials,
} from '@/components/sections/HomeSections'
import {JsonLd} from '@/components/seo/JsonLd'
import {ButtonLink} from '@/components/ui/Button'
import {PhotoPlaceholder} from '@/components/ui/Card'
import {Section, SectionHeader} from '@/components/ui/Layout'
import {
  getFaqs,
  getPage,
  getProjects,
  getServices,
  getSettings,
  getTestimonials,
} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks, showPlaceholders, turnstileSiteKey} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {faqNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()])
  return buildMetadata({
    path: routes.home,
    seo: page?.seo,
    fallbackTitle: 'IIM Technical Services | Electrician & Plumber in Dubai',
    fallbackDescription:
      'Electrical, plumbing, AC, painting and handyman services for Dubai homes and businesses. Book in 3 steps on WhatsApp and pay after the service is done.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function HomePage() {
  const [page, settings, services, faqs, testimonials, projects] = await Promise.all([
    getPage('home'),
    getSettings(),
    getServices(),
    getFaqs(),
    getTestimonials(),
    getProjects(),
  ])
  const home = page?.home
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const emergency = services.find((s) => s.isEmergency)
  const trades = services.filter((s) => s !== emergency)
  const homeFaqs = faqs.filter((f) => f.showOnHome).slice(0, 8)
  const gallery = projects.filter((p) => p.after?.asset).slice(0, 3)

  const graph = await pageGraph({
    path: routes.home,
    name: page?.seo?.metaTitle ?? 'IIM Technical Services',
    description: page?.seo?.metaDescription,
    crumbs: [{name: 'Home'}],
    extra: [faqNode(absoluteUrl('/'), homeFaqs)],
    extraJsonLd: page?.seo?.extraJsonLd,
    modified: page?._updatedAt,
    ratingVisible: true,
  })

  return (
    <>
      <JsonLd data={graph} />

      <HomeHero
        headline={page?.heroHeadline ?? 'Electricians, plumbers and handymen in Dubai.'}
        accent={page?.heroAccent}
        subhead={page?.heroSubhead}
        image={page?.heroImage}
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        settings={settings}
      />

      {/* 2. Services */}
      <Section labelledBy="services-title">
        <SectionHeader
          id="services-title"
          eyebrow="What we do"
          title={home?.servicesHeading ?? 'One team for every repair in your home or business'}
          lead={home?.servicesIntro}
        />
        <ServiceGrid services={trades} />
        {emergency ? (
          <EmergencyBand service={emergency} telHref={links.tel} whatsappHref={links.whatsapp} />
        ) : null}
      </Section>

      {/* 3. How it works */}
      <Section surface="neutral" labelledBy="how-title">
        <SectionHeader id="how-title" eyebrow="How it works" title="Book in three steps" />
        <Steps items={home?.steps ?? []} />
        <p className="mt-5 flex items-center gap-2 font-semibold text-success">
          You pay after the service is done.
        </p>
      </Section>

      {/* 4–5. Why IIM and numbers (numbers hidden until real figures are entered) */}
      <Section surface="dark" labelledBy="why-title">
        <SectionHeader
          id="why-title"
          eyebrow="Why IIM"
          title={home?.whyHeading ?? 'Straightforward maintenance, done properly'}
          tone="dark"
        />
        <ProofPoints items={home?.whyItems ?? []} />
        <Stats stats={settings.stats ?? []} />
      </Section>

      {/* 6. Before and after (placeholder frames on staging only) */}
      {gallery.length || showPlaceholders ? (
        <Section labelledBy="work-title">
          <SectionHeader
            id="work-title"
            eyebrow="Our work"
            title="Before and after"
            lead="Real jobs completed by our team in Dubai homes and businesses."
          />
          {gallery.length ? (
            <BeforeAfter projects={gallery} />
          ) : (
            <div className="grid gap-gap md:grid-cols-3" aria-label="Photos coming soon">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-card overflow-hidden rounded-lg">
                  <PhotoPlaceholder label="before and after pair" />
                </div>
              ))}
            </div>
          )}
          {gallery.length ? (
            <div className="mt-7">
              <ArrowLink href={routes.projects}>See all projects</ArrowLink>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* 7. Annual maintenance highlight with the short form */}
      <Section surface="cream" id="annual-contract" labelledBy="amc-title">
        <div className="grid items-start gap-7 lg:grid-cols-12 lg:gap-gap">
          <div className="grid content-start gap-6 lg:col-span-6">
            <SectionHeader
              id="amc-title"
              eyebrow="Annual Maintenance Contract"
              title={home?.amcHeading ?? 'Premium care, all year round'}
              lead={home?.amcText}
            />
            <Checklist items={home?.amcBullets ?? []} columns={1} />
            <ArrowLink href={routes.amc}>Compare residential and commercial plans</ArrowLink>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-card shadow-md md:p-6 lg:col-span-5 lg:col-start-8">
            <h3 className="mb-2 text-h3 font-bold">Apply for a contract</h3>
            <p className="mb-5 text-neutral-600">
              Leave your details and we will call you to plan the right package.
            </p>
            <AmcForm idPrefix="amc-home" siteKey={turnstileSiteKey} />
          </div>
        </div>
      </Section>

      {/* 8. Testimonials (only approved ones) */}
      {testimonials.length ? (
        <Section labelledBy="reviews-title">
          <SectionHeader id="reviews-title" eyebrow="Reviews" title="What our customers say">
            <RatingSummary settings={settings} />
          </SectionHeader>
          <Testimonials items={testimonials.slice(0, 3)} />
          <div className="mt-7 flex flex-wrap items-center gap-4">
            {settings.reviewUrl ? (
              <ButtonLink href={settings.reviewUrl} external variant="secondary" icon="star">
                Read our Google reviews
              </ButtonLink>
            ) : null}
            <ArrowLink href={routes.reviews}>All reviews</ArrowLink>
          </div>
        </Section>
      ) : null}

      {/* 9. FAQ */}
      {homeFaqs.length ? (
        <Section surface="neutral" labelledBy="faq-title">
          <SectionHeader
            id="faq-title"
            eyebrow="FAQ"
            title={home?.faqHeading ?? 'Questions people ask before booking'}
            center
          />
          <FaqList items={homeFaqs} center />
          <div className="mt-7 flex justify-center">
            <ArrowLink href={routes.faq}>More answers</ArrowLink>
          </div>
        </Section>
      ) : null}

      {/* 10. Final call to action */}
      <CtaBand
        heading={home?.ctaHeading ?? 'Tell us what needs fixing'}
        text={home?.ctaText}
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}
