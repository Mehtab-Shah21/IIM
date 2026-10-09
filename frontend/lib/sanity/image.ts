import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

import {publicEnv} from '@/lib/env'

export type SanityImageValue =
  | {
      alt?: string | null
      asset?: {
        _id?: string | null
        url?: string | null
        width?: number | null
        height?: number | null
        lqip?: string | null
      } | null
      crop?: unknown
      hotspot?: unknown
    }
  | null
  | undefined

const builder = createImageUrlBuilder({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
})

/** Props for Img from a Sanity image (crop applied; width added by the loader). */
export function sanityImage(image: SanityImageValue) {
  if (!image?.asset?._id) return null
  const src = builder
    .image(image as SanityImageSource)
    .auto('format')
    .url()
  return {
    src,
    alt: image.alt ?? '',
    width: image.asset.width ?? 1600,
    height: image.asset.height ?? 1000,
    blurDataURL: image.asset.lqip ?? undefined,
  }
}
