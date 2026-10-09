import type {CSSProperties} from 'react'
import {preload} from 'react-dom'

import sanityImageLoader from '@/lib/sanity/image-loader'

/**
 * Server-rendered responsive image: a plain <img> with a Sanity CDN srcset (AVIF/WebP via
 * `auto=format`), explicit width and height, lazy by default. It replaces next/image because
 * next/image ships a client component (about 7 KB gzipped) on every route that imports it,
 * whether or not an image renders, and that JavaScript delayed LCP on mobile (ADR-005).
 *
 * `priority` is for the LCP image only: eager, fetchpriority=high, and a preload hint.
 */
const widths = [320, 480, 640, 768, 960, 1200, 1600, 1920]

type ImgProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
  priority?: boolean
  /** Tiny blurred preview (Sanity LQIP) shown behind the image while it loads. */
  blurDataURL?: string | null
}

export function Img({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
  blurDataURL,
}: ImgProps) {
  const isSanity = src.startsWith('https://cdn.sanity.io/')
  // Never ask for more than twice the intrinsic width (2x screens).
  const candidates = isSanity ? widths.filter((w) => w <= width * 2) : []
  const srcSet = candidates.length
    ? candidates.map((w) => `${sanityImageLoader({src, width: w})} ${w}w`).join(', ')
    : undefined
  const fallback = isSanity ? sanityImageLoader({src, width}) : src

  if (priority)
    preload(fallback, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: srcSet,
      imageSizes: srcSet ? sizes : undefined,
    })

  const style: CSSProperties | undefined = blurDataURL
    ? {
        backgroundImage: `url("${blurDataURL}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate, see the comment above
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  )
}
