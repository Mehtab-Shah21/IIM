import {defineField, defineType} from 'sanity'

import {countedInput} from '../../components/CountedInput'
import {SeoPreview} from '../../components/SeoPreview'

/** Shared SEO object on every page-level document. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  components: {input: SeoPreview},
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Shown as the blue link on Google. 50–60 characters, unique on every page.',
      components: {input: countedInput({min: 50, max: 60, unit: 'characters'})},
      validation: (rule) => [
        rule.required().error('Every indexable page needs a meta title.'),
        rule.min(50).warning('Shorter than 50 characters.'),
        rule.max(60).warning('Longer than 60 characters: Google may cut it off.'),
      ],
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'The grey text under the link. 140–155 characters, written for people.',
      components: {input: countedInput({min: 140, max: 155, unit: 'characters'})},
      validation: (rule) => [
        rule.required().error('Every indexable page needs a meta description.'),
        rule.min(140).warning('Shorter than 140 characters.'),
        rule.max(155).warning('Longer than 155 characters: Google may cut it off.'),
      ],
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines (noindex)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalOverride',
      title: 'Canonical URL override',
      type: 'url',
      description: 'Leave empty. Only for pages that duplicate another URL.',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'ogImage',
      title: 'Share image (1200 × 630)',
      type: 'image',
      description: 'Shown when the page is shared on WhatsApp, Facebook or LinkedIn.',
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'extraJsonLd',
      title: 'Extra structured data (JSON-LD)',
      type: 'text',
      rows: 6,
      description:
        'Advanced. A JSON object (or array) merged into the page graph. Business, Service and FAQ schema are generated automatically: do not repeat them here.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          try {
            const parsed: unknown = JSON.parse(value)
            if (typeof parsed !== 'object' || parsed === null) return 'Must be a JSON object or array.'
            return true
          } catch {
            return 'Not valid JSON.'
          }
        }),
    }),
  ],
})
