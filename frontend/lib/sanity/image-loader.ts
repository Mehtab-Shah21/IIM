/**
 * next/image loader. Sanity CDN URLs get width, quality and automatic AVIF/WebP from Sanity's
 * image pipeline, so the Node server never resizes images. Local files are served as-is
 * (they are pre-optimised in the repo).
 */
type LoaderArgs = {src: string; width: number; quality?: number}

export default function sanityImageLoader({src, width, quality}: LoaderArgs): string {
  if (!src.startsWith('https://cdn.sanity.io/')) return src
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  return url.toString()
}
