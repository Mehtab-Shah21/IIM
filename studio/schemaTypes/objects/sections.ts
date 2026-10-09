/**
 * The fixed set of page sections (CLAUDE.md §9). Each renders a fixed design on the site, so
 * editors change words and images without being able to break widths, spacing or corners.
 * `checklist` and `callout` are additions to the brief's list (ADR-005).
 */
import {defineArrayMember, defineField, defineType} from 'sanity'

const heading = defineField({name: 'heading', title: 'Heading (H2)', type: 'string'})

export const portableText = defineType({
  name: 'portableText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading 3', value: 'h3'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          defineField({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'string',
                description: 'A path on this site (/services/…) or a full https:// URL.',
                validation: (r) =>
                  r.required().regex(/^(\/|https:\/\/|mailto:|tel:)/, {name: 'path or URL'}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})

/** Long-form text with H2s, used for guides and legal pages. */
export const articleText = defineType({
  name: 'articleText',
  title: 'Article',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          defineField({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'string',
                validation: (r) =>
                  r.required().regex(/^(\/|https:\/\/|mailto:|tel:)/, {name: 'path or URL'}),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({type: 'imageWithAlt'}),
  ],
})

export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Heading and text',
  type: 'object',
  fields: [
    heading,
    defineField({name: 'body', type: 'portableText', validation: (r) => r.required()}),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Text', subtitle: 'Heading and text'}),
  },
})

export const imageTextSection = defineType({
  name: 'imageTextSection',
  title: 'Image and text',
  type: 'object',
  fields: [
    heading,
    defineField({name: 'image', type: 'imageWithAlt', description: 'Real photo, cropped 16:10.'}),
    defineField({
      name: 'imagePosition',
      type: 'string',
      options: {list: ['left', 'right'], layout: 'radio', direction: 'horizontal'},
      initialValue: 'left',
    }),
    defineField({name: 'body', type: 'portableText'}),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({
      title: title || 'Image and text',
      subtitle: 'Image and text',
      media,
    }),
  },
})

export const stepsSection = defineType({
  name: 'stepsSection',
  title: 'Numbered steps',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'text', type: 'text', rows: 2}),
          ],
        }),
      ],
      validation: (r) => r.required().min(2).max(6),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Steps', subtitle: 'Numbered steps'}),
  },
})

export const proofPointsSection = defineType({
  name: 'proofPointsSection',
  title: 'Proof points',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({type: 'iconItem'})],
      validation: (r) => r.required().min(2).max(4),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Proof points', subtitle: 'Proof points'}),
  },
})

export const checklistSection = defineType({
  name: 'checklistSection',
  title: 'Checklist',
  type: 'object',
  fields: [
    heading,
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (r) => r.required().min(2),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Checklist', subtitle: 'Checklist'}),
  },
})

export const calloutSection = defineType({
  name: 'calloutSection',
  title: 'Highlighted note',
  type: 'object',
  fields: [
    heading,
    defineField({name: 'text', type: 'text', rows: 3, validation: (r) => r.required()}),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'text'},
    prepare: ({title, subtitle}) => ({title: title || 'Note', subtitle}),
  },
})

export const gallerySection = defineType({
  name: 'gallerySection',
  title: 'Before and after gallery',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'projects',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (r) => r.max(6),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Gallery', subtitle: 'Before and after gallery'}),
  },
})

export const ctaBandSection = defineType({
  name: 'ctaBandSection',
  title: 'Call-to-action band',
  type: 'object',
  fields: [
    defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'text', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title, subtitle: 'Call-to-action band'}),
  },
})

export const faqListSection = defineType({
  name: 'faqListSection',
  title: 'FAQ',
  type: 'object',
  description: 'Shown as questions and answers and emitted as FAQPage structured data.',
  fields: [
    heading,
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', items: 'items'},
    prepare: ({title, items}) => ({
      title: title || 'FAQ',
      subtitle: `${Array.isArray(items) ? items.length : 0} questions`,
    }),
  },
})

export const relatedServicesSection = defineType({
  name: 'relatedServicesSection',
  title: 'Related services',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Related services', subtitle: 'Related services'}),
  },
})

export const sectionTypes = [
  'richTextSection',
  'imageTextSection',
  'stepsSection',
  'proofPointsSection',
  'checklistSection',
  'calloutSection',
  'gallerySection',
  'ctaBandSection',
  'faqListSection',
  'relatedServicesSection',
] as const

export const sectionsField = defineField({
  name: 'sections',
  title: 'Page sections',
  type: 'array',
  of: sectionTypes.map((type) => defineArrayMember({type})),
  options: {insertMenu: {views: [{name: 'list'}]}},
})
