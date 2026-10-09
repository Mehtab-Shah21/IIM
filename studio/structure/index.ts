import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

/** Desk: Pages, Services, Areas, Guides, Projects, Reviews, FAQs, Redirects, Settings. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.listItem()
        .title('Services')
        .schemaType('service')
        .child(
          S.documentTypeList('service')
            .title('Services')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.documentTypeListItem('area').title('Areas'),
      S.documentTypeListItem('guide').title('Guides'),
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('testimonial').title('Reviews'),
      S.listItem()
        .title('FAQs')
        .schemaType('faq')
        .child(
          S.documentTypeList('faq')
            .title('FAQs')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.documentTypeListItem('redirect').title('Redirects'),
      S.divider(),
      S.listItem()
        .title('Business info and settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Business info and settings'),
        ),
    ])
