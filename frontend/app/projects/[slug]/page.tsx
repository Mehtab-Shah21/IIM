import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'

import {BeforeAfter, RichText} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {AsideCta, ChipLinks, ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {getProject, getSettings, getSlugs} from '@/lib/content'
import {serviceWhatsappMessage} from '@/lib/contact'
import {contactLinks, formatDate} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {sanityImage} from '@/lib/sanity/image'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type Props = {params: Promise<{slug: string}>}

export async function generateStaticParams() {
  return (await getSlugs('project')).map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const [project, settings] = await Promise.all([getProject(slug), getSettings()])
  if (!project) return {}
  return buildMetadata({
    path: routes.project(slug),
    seo: project.seo,
    fallbackTitle: `${project.title} | Our Work in Dubai | IIM`,
    fallbackDescription: project.summary ?? `A completed ${project.service?.title?.toLowerCase() ?? 'maintenance'} job by IIM Technical Services.`,
    defaultOgImage: project.after ?? settings.defaultOgImage,
  })
}

export default async function ProjectPage({params}: Props) {
  const {slug} = await params
  const [project, settings] = await Promise.all([getProject(slug), getSettings()])
  if (!project) notFound()

  const message = serviceWhatsappMessage(project.service?.whatsappNoun, project.service?.title)
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'Projects', href: routes.projects}, {name: project.title ?? ''}]
  const completed = formatDate(project.completed)
  const quoteHref = quoteUrl(project.service?.slug ?? undefined)

  return (
    <>
      <JsonLd data={await pageGraph({path: routes.project(slug), name: project.title ?? '', description: project.summary, crumbs, extraJsonLd: project.seo?.extraJsonLd, modified: project._updatedAt})} />
      <PageHero
        title={project.title ?? ''}
        eyebrow="Project"
        lead={project.summary}
        crumbs={crumbs}
        meta={
          <>
            {project.location ? <span>{project.location}</span> : null}
            {completed ? <span>Completed {completed}</span> : null}
          </>
        }
      />
      <ContentLayout asideLabel="Book a similar job" aside={<AsideCta heading="Need something similar?" quoteHref={quoteHref} whatsappHref={links.whatsapp} telHref={links.tel} phoneDisplay={links.phoneDisplay} />}>
        <BeforeAfter projects={[project]} />
        <RichText value={project.body} />
        {project.gallery?.length ? (
          <section className="grid gap-4" aria-labelledby="gallery-title">
            <h2 id="gallery-title" className="text-h2 font-bold">
              More photos
            </h2>
            <div className="grid gap-gap sm:grid-cols-2">
              {project.gallery.map((g, i) => {
                const img = sanityImage(g)
                return img ? (
                  <div key={i} className="aspect-card overflow-hidden rounded-lg bg-neutral-100">
                    <Image src={img.src} alt={img.alt} width={800} height={500} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" />
                  </div>
                ) : null
              })}
            </div>
          </section>
        ) : null}
        <ChipLinks
          items={[
            ...(project.service?.slug ? [{href: routes.service(project.service.slug), label: project.service.title ?? ''}] : []),
            ...(project.area?.slug ? [{href: routes.area(project.area.slug), label: project.area.title ?? ''}] : []),
          ]}
        />
      </ContentLayout>
      <ContactDock message={message} />
    </>
  )
}
