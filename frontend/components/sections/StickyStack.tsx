'use client'

/**
 * Photo cards that stick and stack while scrolling: as the next card slides over, the one
 * beneath shrinks and tilts away. Adapted from Skiper UI "Skiper 34 / StickyCard_003"
 * (skiper-ui.com), rebuilt without Lenis or Framer Motion: the cards are plain sticky
 * elements (they stack even without JavaScript) and one passive scroll handler sets a single
 * `--p` (0-1, how far the card is covered) per card. Reduced motion: no tilt or shrink.
 */
import Link from 'next/link'
import {type CSSProperties, useEffect, useRef} from 'react'

import {Icon} from '@/components/icons/Icon'
import {Img} from '@/components/ui/Img'

export type StackItem = {
  src: string
  alt: string
  width: number
  height: number
  title: string
  href?: string
}

export function StickyStack({items}: {items: StackItem[]}) {
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cards = [...list.children] as HTMLElement[]
    let frame = 0
    const update = () => {
      frame = 0
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        const a = card.getBoundingClientRect()
        const b = next.getBoundingClientRect()
        // 0 while the next card is still below; 1 once it fully covers this one.
        const p = Math.max(0, Math.min(1, (a.bottom - b.top) / a.height))
        card.style.setProperty('--p', p.toFixed(3))
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, {passive: true})
    window.addEventListener('resize', schedule)
    update()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <ol ref={listRef} className="sticky-stack">
      {items.map((item, i) => (
        <li key={item.src} className="sticky-stack-card" style={{'--p': 0} as CSSProperties}>
          <div className="sticky-stack-photo">
            <Img
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 1024px) 896px, 100vw"
              className="size-full object-cover"
            />
          </div>
          <div className="sticky-stack-caption">
            <span className="text-small font-semibold tracking-wide text-accent uppercase">
              {String(i + 1).padStart(2, '0')}
            </span>
            {item.href ? (
              <Link href={item.href} className="sticky-stack-link">
                {item.title}
                <Icon name="arrow-right" size="sm" />
              </Link>
            ) : (
              <span className="font-heading text-h4 font-bold">{item.title}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
