'use client'

/**
 * "What we do" grid on the homepage. Adapted from the owner-supplied "TeamRevealGrid": one
 * service at a time is highlighted (photo in colour, lifted, short description over the photo)
 * while the others rest in greyscale; the highlight moves on by itself.
 *
 * Differences from the original, on purpose:
 * - every card is a link to its service page (stretched link on the heading), as before;
 * - card size never changes (transforms only), so there is no layout shift;
 * - rotation runs only while the grid is on screen, stops on hover or focus, has a pause button
 *   (WCAG 2.2.2) and never starts with reduced motion;
 * - without JavaScript every photo is in colour and every card works as a normal link.
 */
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'
import {Img} from '@/components/ui/Img'
import {useHydrated, useReducedMotion} from '@/lib/client-env'

export type RevealService = {
  id: string
  title: string
  href: string
  icon: IconName
  tagline?: string | null
  summary?: string | null
  image?: {src: string; alt: string; width: number; height: number} | null
}

const INTERVAL = 2800

export function ServiceReveal({services}: {services: RevealService[]}) {
  const [active, setActive] = useState(0)
  const armed = useHydrated()
  const still = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      threshold: 0.3,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const running = armed && !still && !paused && !hovering && visible && services.length > 1
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setActive((i) => (i + 1) % services.length), INTERVAL)
    return () => window.clearInterval(timer)
  }, [running, services.length])

  return (
    <div ref={rootRef} className="grid gap-4">
      <ul
        className={armed ? 'service-reveal is-armed' : 'service-reveal'}
        onPointerLeave={() => setHovering(false)}
      >
        {services.map((s, i) => {
          const on = i === active
          return (
            <li
              key={s.id}
              className={on ? 'service-reveal-card is-active' : 'service-reveal-card'}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return
                setHovering(true)
                setActive(i)
              }}
              onFocus={() => {
                setHovering(true)
                setActive(i)
              }}
              onBlur={() => setHovering(false)}
            >
              <div className="service-reveal-media">
                {s.image ? (
                  <Img
                    src={s.image.src}
                    alt=""
                    width={s.image.width}
                    height={s.image.height}
                    sizes="(min-width: 1024px) 380px, 50vw"
                    className="size-full object-cover"
                  />
                ) : null}
                {s.summary ? <p className="service-reveal-summary">{s.summary}</p> : null}
              </div>
              <div className="flex items-start gap-3 p-4">
                <span className="grid size-icon-tile shrink-0 place-items-center rounded-sm bg-ink-900 text-accent">
                  <Icon name={s.icon} />
                </span>
                <div className="grid min-w-0 gap-1">
                  <h3 className="text-h4 font-bold text-ink-900">
                    <Link
                      href={s.href}
                      className="stretched-link no-underline"
                      data-track="cta_click"
                      data-track-location="service_grid"
                    >
                      {s.title}
                    </Link>
                  </h3>
                  {s.tagline ? <p className="text-small text-neutral-600">{s.tagline}</p> : null}
                </div>
                <Icon
                  name="arrow-right"
                  size="sm"
                  className="service-reveal-arrow ml-auto shrink-0"
                />
              </div>
            </li>
          )
        })}
      </ul>
      {armed && !still && services.length > 1 ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="min-h-tap justify-self-end text-small font-semibold text-neutral-600 underline underline-offset-4 hover:text-ink-900"
        >
          {paused ? 'Resume highlights' : 'Pause highlights'}
        </button>
      ) : null}
    </div>
  )
}
