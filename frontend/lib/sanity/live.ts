/**
 * Live content (ADR-004): `sanityFetch` tags every query with Content Lake sync tags and
 * `<SanityLive>` revalidates them when content is published, so edits appear without a deploy.
 * The viewer token (server-side only) enables drafts for the Presentation tool.
 */
import {defineLive} from 'next-sanity/live'

import {makeClient} from './client'

const token = process.env.SANITY_API_READ_TOKEN || undefined

export const {sanityFetch, SanityLive} = defineLive({
  client: makeClient(),
  serverToken: token,
  browserToken: token,
})
