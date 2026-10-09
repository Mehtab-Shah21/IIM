'use client'

/**
 * Homepage hero photo carousel with a 3D "creative" transition: neighbouring photos tilt and
 * recede. Adapted from Skiper UI "Skiper 50 / Carousel_004" (skiper-ui.com), rebuilt without
 * Swiper or Framer Motion:
 * - the track is a native scroll-snap list: swipe, trackpad and keyboard scrolling work, and so
 *   does the whole carousel without JavaScript (a plain swipeable row);
 * - a requestAnimationFrame scroll handler only sets two CSS variables per slide;
 * - no autoplay (WCAG 2.2.2), previous/next and dot buttons for keyboard and mouse users;
 * - reduced motion: no tilt, instant jumps.
 */
import Link from 'next/link'
import {type CSSProperties, useCallback, useEffect, useRef, useState} from 'react'

import {Icon} from '@/components/icons/Icon'
import {Img} from '@/components/ui/Img'
import {useHydrated} from '@/lib/client-env'

export type HeroSlide = {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
  href?: string
}

export function HeroCarousel({slides, label}: {slides: HeroSlide[]; label: string}) {
  const trackRef = useRef<HTMLUListElement>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const ready = useHydrated()

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const items = [...track.children] as HTMLElement[]
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const update = () => {
      frame = 0
      const box = track.getBoundingClientRect()
      const centre = box.left + box.width / 2
      let best = 0
      let bestDistance = Infinity
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const offset = (r.left + r.width / 2 - centre) / r.width
        const o = still ? 0 : Math.max(-1.5, Math.min(1.5, offset))
        el.style.setProperty('--o', o.toFixed(3))
        el.style.setProperty('--a', Math.abs(o).toFixed(3))
        if (Math.abs(offset) < bestDistance) {
          bestDistance = Math.abs(offset)
          best = i
        }
      })
      if (best !== activeRef.current) {
        activeRef.current = best
        setActive(best)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    track.addEventListener('scroll', schedule, {passive: true})
    window.addEventListener('resize', schedule)
    update()
    return () => {
      track.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    const el = track?.children[index] as HTMLElement | undefined
    if (!track || !el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: still ? 'auto' : 'smooth',
    })
  }, [])

  const count = slides.length
  return (
    <div className="hero-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={trackRef} className="hero-carousel-track" tabIndex={0} aria-label={label}>
        {slides.map((s, i) => (
          <li
            key={s.src}
            className="hero-carousel-slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            style={{'--o': i === 0 ? 0 : 1, '--a': i === 0 ? 0 : 1} as CSSProperties}
          >
            <Img
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              priority={i === 0}
              sizes="(min-width: 1024px) 380px, 80vw"
              className="size-full object-cover"
            />
            {s.caption && s.href ? (
              <Link
                href={s.href}
                className="hero-carousel-caption"
                tabIndex={i === active ? 0 : -1}
                data-track="cta_click"
                data-track-location="hero_carousel"
              >
                {s.caption}
                <Icon name="arrow-right" size="sm" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      {count > 1 ? (
        <div className="hero-carousel-controls" hidden={!ready}>
          <button
            type="button"
            className="hero-carousel-arrow"
            onClick={() => goTo(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Previous photo"
          >
            <Icon name="chevron-left" size="sm" />
          </button>
          <p className="hero-carousel-count" aria-live="polite">
            {active + 1} / {count}
          </p>
          <div className="hero-carousel-dots">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                className="hero-carousel-dot"
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-carousel-arrow"
            onClick={() => goTo(Math.min(count - 1, active + 1))}
            disabled={active === count - 1}
            aria-label="Next photo"
          >
            <Icon name="chevron-right" size="sm" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
