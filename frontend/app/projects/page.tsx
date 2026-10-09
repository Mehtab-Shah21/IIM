import type {Metadata} from 'next'

import {BeforeAfter, CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Section} from '@/components/ui/Layout'
import {getPage, getProjects, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, projects] = await Promise.all([
    getPage('projects'),
    getSettings(),
    getProjects(),
  ])
  return buildMetadata({
    path: routes.projects,
    seo: page?.seo,
    fallbackTitle: 'Our Work | Completed Projects in Dubai | IIM',
    fallbackDescription:
      'Photos of real electrical, plumbing, painting and renovation jobs completed across Dubai.',
    // A hub with no projects yet is thin content: keep it out of the index until it has some.
    noindex: projects.length === 0,
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function ProjectsHub() {
  const [page, settings, projects] = await Promise.all([
    getPage('projects'),
    getSettings(),
    getProjects(),
  ])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const title = page?.heroHeadline ?? 'Our work in Dubai'
  const crumbs = [homeCrumb, {name: 'Projects'}]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.projects,
          name: title,
          crumbs,
          modified: page?._updatedAt,
          pageType: 'CollectionPage',
        })}
      />
      <PageHero title={title} eyebrow="Projects" lead={page?.heroSubhead} crumbs={crumbs} />
      <Section labelledBy="projects-list">
        <h2 id="projects-list" className="sr-only">
          Projects
        </h2>
        {projects.length ? (
          <BeforeAfter projects={projects} />
        ) : (
          <p className="max-w-prose text-lead">
            Project photos are on their way. In the meantime, ask us on WhatsApp for examples of
            similar jobs.
          </p>
        )}
      </Section>
      <CtaBand
        heading="Need something similar?"
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}
