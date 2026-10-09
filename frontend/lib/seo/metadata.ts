import type {Metadata} from 'next'

import {siteUrl} from '@/lib/env'
import {sanityImage, type SanityImageValue} from '@/lib/sanity/image'

export type SeoFields = {
  metaTitle?: string | null
  metaDescription?: string | null
  noindex?: boolean | null
  canonicalOverride?: string | null
  ogImage?: SanityImageValue
} | null | undefined

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * The single metadata builder (CLAUDE.md §11). Titles from the CMS are used as-is
 * (`title.absolute`, no automatic suffix); empty fields fall back to per-type templates.
 * Canonicals are always absolute https://www… URLs.
 */
export function buildMetadata({
  path,
  seo,
  fallbackTitle,
  fallbackDescription,
  noindex = false,
  defaultOgImage,
  type = 'website',
}: {
  path: string
  seo?: SeoFields
  fallbackTitle: string
  fallbackDescription: string
  noindex?: boolean
  defaultOgImage?: SanityImageValue
  type?: 'website' | 'article'
}): Metadata {
  const title = seo?.metaTitle?.trim() || fallbackTitle
  const description = seo?.metaDescription?.trim() || fallbackDescription
  const canonical = seo?.canonicalOverride?.trim() || absoluteUrl(path)
  const hidden = noindex || Boolean(seo?.noindex)
  const og = sanityImage(seo?.ogImage) ?? sanityImage(defaultOgImage)
  const images = og
    ? [{url: `${og.src}${og.src.includes('?') ? '&' : '?'}w=1200&h=630&fit=crop`, width: 1200, height: 630, alt: og.alt || title}]
    : undefined // falls back to app/opengraph-image.tsx

  return {
    title: {absolute: title},
    description,
    alternates: {canonical},
    robots: hidden ? {index: false, follow: true} : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'IIM Technical Services',
      locale: 'en_AE',
      type,
      ...(images ? {images} : {}),
    },
    twitter: {card: 'summary_large_image', title, description, ...(images ? {images: images.map((i) => i.url)} : {})},
  }
}
