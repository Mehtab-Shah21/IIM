import type {Section} from '@/lib/content'

import {
  BeforeAfter,
  Callout,
  Checklist,
  ContentBlock,
  FaqList,
  ImageText,
  ProofPoints,
  RichText,
  ServiceGrid,
  Steps,
} from './Blocks'

/**
 * Renders the CMS "page sections" array. Each type has one fixed design; ctaBand sections are
 * rendered by the page (full-width band) so they are skipped here.
 */
export function SectionRenderer({sections}: {sections?: Section[] | null}) {
  if (!sections?.length) return null
  return (
    <>
      {sections.map((s, i) => {
        const id = `section-${i}`
        switch (s._type) {
          case 'richTextSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <RichText value={s.body} />
              </ContentBlock>
            )
          case 'imageTextSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <ImageText heading={s.heading} image={s.image} imagePosition={s.imagePosition} body={s.body} />
              </ContentBlock>
            )
          case 'stepsSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <Steps items={s.items ?? []} />
              </ContentBlock>
            )
          case 'proofPointsSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <ProofPoints items={s.items ?? []} tone="light" />
              </ContentBlock>
            )
          case 'checklistSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                {s.intro ? <p>{s.intro}</p> : null}
                <Checklist items={s.items ?? []} />
              </ContentBlock>
            )
          case 'calloutSection':
            return (
              <div key={s._key} data-reveal>
                <Callout heading={s.heading} text={s.text} />
              </div>
            )
          case 'gallerySection':
            return s.projects?.length ? (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <BeforeAfter projects={s.projects} />
              </ContentBlock>
            ) : null
          case 'faqListSection':
            return (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <FaqList items={s.items ?? []} />
              </ContentBlock>
            )
          case 'relatedServicesSection':
            return s.services?.length ? (
              <ContentBlock key={s._key} id={id} heading={s.heading}>
                <ServiceGrid services={s.services} />
              </ContentBlock>
            ) : null
          default:
            return null
        }
      })}
    </>
  )
}

/** All FAQ items in a sections array (for FAQPage schema: exactly what the page shows). */
export function faqsFromSections(sections?: Section[] | null) {
  return (sections ?? []).flatMap((s) => (s._type === 'faqListSection' ? (s.items ?? []) : []))
}

/** The first CTA band section, if the editor added one. */
export function ctaFromSections(sections?: Section[] | null) {
  const s = (sections ?? []).find((x) => x._type === 'ctaBandSection')
  return s && s._type === 'ctaBandSection' ? {heading: s.heading ?? '', text: s.text} : null
}
