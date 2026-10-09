import {createClient} from 'next-sanity'

import {publicEnv} from '@/lib/env'

/**
 * Public read client (CDN, published perspective). Only constructed when a Sanity project is
 * configured; see lib/sanity/fetch.ts for the fixture fallback.
 */
export function makeClient() {
  const projectId = publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
  return createClient({
    projectId,
    dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
    perspective: 'published',
    stega: {studioUrl: publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL},
  })
}
