import type {Metadata} from 'next'

import {CtaBand, FaqList} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Section} from '@/components/ui/Layout'
import {getFaqs, getPage, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {faqNode} from '@/lib/seo/jsonld'
import {absoluteUrl, buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

const topics = [
  {value: 'booking', title: 'Booking and payment'},
  {value: 'services', title: 'Services and coverage'},
  {value: 'emergencies', title: 'Emergencies'},
  {value: 'contracts', title: 'Annual contracts'},
]

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('faq'), getSettings()])
  return buildMetadata({
    path: routes.faq,
    seo: page?.seo,
    fallbackTitle: 'FAQs | Maintenance & Repair Services in Dubai | IIM',
    fallbackDescription:
      'Answers on booking, pricing, payment, emergency visits and annual contracts.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function FaqPage() {
  const [page, settings, faqs] = await Promise.all([getPage('faq'), getSettings(), getFaqs()])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'FAQ'}]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.faq,
          name: page?.heroHeadline ?? 'FAQ',
          crumbs,
          extra: [faqNode(absoluteUrl(routes.faq), faqs)],
          modified: page?._updatedAt,
        })}
      />
      <PageHero
        title={page?.heroHeadline ?? 'Frequently asked questions'}
        eyebrow="FAQ"
        lead={page?.heroSubhead}
        crumbs={crumbs}
      />
      <Section>
        <div className="grid gap-8">
          {topics.map((t) => {
            const items = faqs.filter((f) => f.topic === t.value)
            return items.length ? (
              <section key={t.value} className="grid gap-4" aria-labelledby={`topic-${t.value}`}>
                <h2 id={`topic-${t.value}`} className="text-h2 font-bold">
                  {t.title}
                </h2>
                <FaqList items={items} />
              </section>
            ) : null
          })}
        </div>
      </Section>
      <CtaBand
        heading="Did not find your answer?"
        text="Send us your question on WhatsApp with a photo of the issue and we will reply."
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}
