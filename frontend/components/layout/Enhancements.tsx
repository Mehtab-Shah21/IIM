'use client'

/**
 * Small progressive enhancements, all optional (the site works without JavaScript):
 * - fade-and-rise for [data-reveal] elements below the first screen (no layout shift)
 * - number counters for [data-count-to]
 * - analytics events for links marked with data-track
 * - GA4 loaded after the page is idle, only when an ID is configured
 */
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

import {track, type TrackEvent} from '@/lib/analytics/track'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Enhancements({gaId}: {gaId?: string}) {
  const pathname = usePathname()

  useEffect(() => {
    if (reduced() || !('IntersectionObserver' in window)) return
    const fold = window.innerHeight
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          if (el.dataset.countTo) animateCount(el)
          else el.classList.add('is-visible')
          io.unobserve(el)
        }
      },
      {rootMargin: '0px 0px -10% 0px'},
    )
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-count-to]').forEach((el) => {
      if (el.getBoundingClientRect().top < fold) return // already visible: leave as rendered
      if (el.dataset.countTo) {
        io.observe(el)
        return
      }
      el.classList.add('reveal-armed')
      io.observe(el)
    })
    return () => io.disconnect()
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      track(el.dataset.track as TrackEvent, {
        link_location: el.dataset.trackLocation,
        page_path: window.location.pathname,
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!gaId || window.gtag) return
    const load = () => {
      window.dataLayer ??= []
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params -- gtag requires the arguments object
        window.dataLayer!.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', gaId, {anonymize_ip: true})
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
      document.head.appendChild(s)
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: {timeout: number}) => number
    }
    if (w.requestIdleCallback) w.requestIdleCallback(load, {timeout: 4000})
    else setTimeout(load, 3000)
  }, [gaId])

  return null
}

function animateCount(el: HTMLElement) {
  const target = Number(el.dataset.countTo)
  const suffix = el.dataset.countSuffix ?? ''
  if (!Number.isFinite(target) || target <= 0) return
  const fmt = new Intl.NumberFormat('en')
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / 1200)
    el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
