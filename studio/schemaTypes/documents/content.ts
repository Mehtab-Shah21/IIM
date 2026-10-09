import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {CommentIcon} from '@sanity/icons/Comment'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {ImagesIcon} from '@sanity/icons/Images'
import {PinIcon} from '@sanity/icons/Pin'
import {WrenchIcon} from '@sanity/icons/Wrench'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {countedInput} from '../../components/CountedInput'
import {directAnswerField, iconOptions, lastReviewedField, slugField} from '../objects/common'
import {sectionsField} from '../objects/sections'

const heroHeadline = defineField({
  name: 'heroHeadline',
  title: 'H1 headline',
  type: 'string',
  description: 'The one H1 on the page. Include the service and "Dubai" where natural.',
  validation: (r) => r.required().max(90),
})
const heroSubhead = defineField({
  name: 'heroSubhead',
  title: 'Subheading',
  type: 'text',
  rows: 2,
  validation: (r) => r.max(220),
})
const seoField = defineField({name: 'seo', type: 'seo', group: 'seo'})
const groups = [
  {name: 'content', title: 'Content', default: true},
  {name: 'card', title: 'Card and menu'},
  {name: 'seo', title: 'SEO'},
]

/** Fixed pages. The URL is fixed in code; this document supplies the content. */
export const pageKeys = [
  {title: 'Home', value: 'home'},
  {title: 'Services hub', value: 'services'},
  {title: 'Areas hub', value: 'areas'},
  {title: 'Projects hub', value: 'projects'},
  {title: 'Guides hub', value: 'guides'},
  {title: 'Annual Maintenance Contract', value: 'amc'},
  {title: 'AMC: Residential', value: 'amc-residential'},
  {title: 'AMC: Commercial', value: 'amc-commercial'},
  {title: 'About', value: 'about'},
  {title: 'Reviews', value: 'reviews'},
  {title: 'FAQ', value: 'faq'},
  {title: 'Contact', value: 'contact'},
  {title: 'Get a Quote', value: 'get-a-quote'},
  {title: 'Thank you', value: 'thank-you'},
  {title: 'Privacy Policy', value: 'privacy-policy'},
  {title: 'Terms', value: 'terms'},
  {title: 'Accessibility', value: 'accessibility'},
]

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
  groups,
  fields: [
    defineField({
      name: 'key',
      title: 'Which page',
      type: 'string',
      options: {list: pageKeys},
      readOnly: ({document}) => Boolean(document?._createdAt && document?.key),
      validation: (r) =>
        r.required().custom(async (key, context) => {
          if (!key) return true
          const client = context.getClient({apiVersion: '2026-10-01'})
          const id = (context.document?._id ?? '').replace(/^drafts\./, '')
          const count = await client.fetch<number>(
            'count(*[_type == "page" && key == $key && !(_id in [$id, "drafts." + $id])])',
            {key, id},
          )
          return count === 0 ? true : 'Another page already uses this key.'
        }),
    }),
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    heroHeadline,
    defineField({
      name: 'heroAccent',
      title: 'H1 accent line (home only)',
      type: 'string',
      hidden: ({document}) => document?.key !== 'home',
    }),
    heroSubhead,
    defineField({name: 'heroImage', title: 'Hero image', type: 'imageWithAlt'}),
    {...directAnswerField, validation: undefined},
    defineField({
      name: 'cardSummary',
      title: 'Card summary',
      type: 'text',
      rows: 2,
      group: 'card',
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'home',
      title: 'Homepage sections',
      type: 'object',
      hidden: ({document}) => document?.key !== 'home',
      fields: [
        defineField({name: 'servicesHeading', type: 'string'}),
        defineField({name: 'servicesIntro', type: 'text', rows: 2}),
        defineField({
          name: 'steps',
          title: 'How it works (3 steps)',
          type: 'array',
          of: [defineArrayMember({type: 'iconItem'})],
          validation: (r) => r.length(3),
        }),
        defineField({name: 'whyHeading', type: 'string'}),
        defineField({
          name: 'whyItems',
          title: 'Why IIM (4 proof points)',
          type: 'array',
          of: [defineArrayMember({type: 'iconItem'})],
          validation: (r) => r.max(4),
        }),
        defineField({name: 'amcHeading', type: 'string'}),
        defineField({name: 'amcText', type: 'text', rows: 2}),
        defineField({
          name: 'amcBullets',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          validation: (r) => r.max(5),
        }),
        defineField({name: 'faqHeading', type: 'string'}),
        defineField({name: 'ctaHeading', type: 'string'}),
        defineField({name: 'ctaText', type: 'text', rows: 2}),
      ],
    }),
    sectionsField,
    defineField({name: 'body', title: 'Body (legal and simple pages)', type: 'articleText'}),
    lastReviewedField,
    seoField,
  ],
  preview: {
    select: {title: 'title', key: 'key'},
    prepare: ({title, key}) => ({title, subtitle: pageKeys.find((k) => k.value === key)?.title}),
  },
})

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: WrenchIcon,
  groups,
  orderings: [{title: 'Menu order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    slugField(),
    defineField({
      name: 'order',
      title: 'Menu order',
      type: 'number',
      group: 'card',
      initialValue: 10,
    }),
    defineField({
      name: 'icon',
      type: 'string',
      group: 'card',
      options: {list: iconOptions},
      initialValue: 'wrench',
    }),
    defineField({name: 'menuSummary', type: 'string', group: 'card', validation: (r) => r.max(60)}),
    defineField({
      name: 'cardSummary',
      type: 'text',
      rows: 3,
      group: 'card',
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: 'cardImage',
      title: 'Card image (16:10)',
      type: 'imageWithAlt',
      group: 'card',
    }),
    defineField({
      name: 'isEmergency',
      title: 'Emergency service',
      type: 'boolean',
      group: 'card',
      initialValue: false,
      description: 'Shown as a highlighted band rather than a card.',
    }),
    defineField({
      name: 'whatsappNoun',
      title: 'WhatsApp phrase',
      type: 'string',
      description: 'Completes "Hi IIM, I need … in Dubai." Example: an electrician',
    }),
    defineField({
      name: 'schemaServiceType',
      title: 'Schema service type',
      type: 'string',
      group: 'seo',
    }),
    heroHeadline,
    heroSubhead,
    defineField({
      name: 'heroImage',
      title: 'Hero image (4:3)',
      type: 'imageWithAlt',
      description:
        'A real photo of this kind of job. Shown next to the headline; it loads first, so keep it under 200 KB.',
    }),
    directAnswerField,
    sectionsField,
    defineField({
      name: 'prices',
      title: 'Starting prices (hidden until confirmed)',
      type: 'array',
      of: [defineArrayMember({type: 'priceItem'})],
    }),
    defineField({
      name: 'showPrices',
      title: 'Show prices on this service',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (r) => r.max(3),
    }),
    defineField({name: 'reviewer', title: 'Reviewed by', type: 'personRef'}),
    lastReviewedField,
    seoField,
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})

export const area = defineType({
  name: 'area',
  title: 'Area',
  type: 'document',
  icon: PinIcon,
  groups,
  fields: [
    defineField({
      name: 'title',
      title: 'Area name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    slugField(),
    defineField({
      name: 'cardSummary',
      type: 'text',
      rows: 2,
      group: 'card',
      validation: (r) => r.max(140),
    }),
    heroHeadline,
    heroSubhead,
    directAnswerField,
    sectionsField,
    defineField({
      name: 'services',
      title: 'Services offered here',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    lastReviewedField,
    seoField,
  ],
})

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImagesIcon,
  groups,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    slugField(),
    defineField({name: 'summary', type: 'text', rows: 3, validation: (r) => r.max(220)}),
    defineField({
      name: 'location',
      title: 'Location (as shown)',
      type: 'string',
      description: 'e.g. "Villa, Al Barsha". No customer names or unit numbers.',
    }),
    defineField({name: 'completed', type: 'date'}),
    defineField({name: 'service', type: 'reference', to: [{type: 'service'}]}),
    defineField({name: 'area', type: 'reference', to: [{type: 'area'}]}),
    defineField({
      name: 'before',
      title: 'Before photo',
      type: 'imageWithAlt',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'after',
      title: 'After photo',
      type: 'imageWithAlt',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [defineArrayMember({type: 'imageWithAlt'})],
      validation: (r) => r.max(8),
    }),
    defineField({name: 'body', title: 'What we did', type: 'portableText'}),
    seoField,
  ],
  preview: {select: {title: 'title', subtitle: 'location', media: 'after'}},
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Customer name (as agreed)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({name: 'quote', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({
      name: 'permissionConfirmed',
      title: 'Customer agreed to publication',
      type: 'boolean',
      initialValue: false,
      description: 'Testimonials stay hidden until this is on.',
    }),
    defineField({
      name: 'context',
      type: 'string',
      description: 'e.g. "Annual contract, villa in Mirdif"',
    }),
    defineField({name: 'rating', type: 'number', validation: (r) => r.min(1).max(5).integer()}),
    defineField({name: 'source', type: 'string', options: {list: ['Google', 'Direct', 'Other']}}),
    defineField({name: 'sourceUrl', title: 'Link to the original review', type: 'url'}),
    defineField({name: 'order', type: 'number', initialValue: 10}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'quote', ok: 'permissionConfirmed'},
    prepare: ({title, subtitle, ok}) => ({title: `${ok ? '' : '[hidden] '}${title}`, subtitle}),
  },
})

export const faqTopics = [
  {title: 'Booking and payment', value: 'booking'},
  {title: 'Services and coverage', value: 'services'},
  {title: 'Emergencies', value: 'emergencies'},
  {title: 'Annual contracts', value: 'contracts'},
]

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'question', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'answer', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({
      name: 'topic',
      type: 'string',
      options: {list: faqTopics},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'showOnHome',
      title: 'Show on the homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Keep 6 to 8 of these.',
    }),
    defineField({name: 'order', type: 'number', initialValue: 10}),
  ],
  preview: {select: {title: 'question', subtitle: 'topic'}},
})

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: BulbOutlineIcon,
  groups,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      components: {input: countedInput({min: 30, max: 70, unit: 'characters'})},
      validation: (r) => r.required(),
    }),
    slugField(),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 2,
      group: 'card',
      validation: (r) => r.max(200),
    }),
    defineField({name: 'coverImage', type: 'imageWithAlt', group: 'card'}),
    directAnswerField,
    defineField({name: 'body', type: 'articleText', validation: (r) => r.required()}),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
    }),
    defineField({
      name: 'author',
      title: 'Written by',
      type: 'personRef',
      validation: (r) => r.required(),
    }),
    defineField({name: 'reviewer', title: 'Reviewed by (named technician)', type: 'personRef'}),
    defineField({name: 'publishedAt', type: 'date', validation: (r) => r.required()}),
    lastReviewedField,
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (r) => r.min(1).max(3),
    }),
    seoField,
  ],
})
