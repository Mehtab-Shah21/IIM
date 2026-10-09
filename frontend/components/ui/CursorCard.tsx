'use client'

/**
 * Inline link that shows a small photo-and-description card following the mouse. Adapted from
 * the owner-supplied "CursorCard", rebuilt without Framer Motion: a requestAnimationFrame
 * loop eases the card towards the pointer (a light spring feel), only while hovered.
 *
 * Mouse only: on touch screens and keyboard focus it is an ordinary underlined link, so
 * nothing is hidden behind hover. The card is decorative (aria-hidden): the link text and its
 * destination carry the meaning. Reduced motion: the card jumps instead of gliding.
 */
import Link from 'next/link'
import {type ReactNode, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

import {Img} from '@/components/ui/Img'
import {useHydrated, useReducedMotion} from '@/lib/client-env'

export type CursorCardImage = {src: string; width: number; height: number}

export function CursorCard({
  href,
  image,
  description,
  children,
}: {
  href: string
  image?: CursorCardImage | null
  description: string
  children: ReactNode
}) {
  const hydrated = useHydrated()
  const still = useReducedMotion()
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const target = useRef({x: 0, y: 0})
  const pos = useRef({x: 0, y: 0})

  useEffect(() => {
    if (!open) return
    let frame = 0
    const tick = () => {
      const k = still ? 1 : 0.22
      pos.current.x += (target.current.x - pos.current.x) * k
      pos.current.y += (target.current.y - pos.current.y) * k
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [open, still])

  const place = (e: React.PointerEvent) => {
    const width = cardRef.current?.offsetWidth ?? 240
    // Below and centred on the pointer, kept inside the window.
    target.current = {
      x: Math.min(Math.max(8, e.clientX - width / 2), window.innerWidth - width - 8),
      y: e.clientY + 20,
    }
  }

  return (
    <>
      <Link
        href={href}
        className="cursor-card-link"
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          place(e)
          pos.current = {...target.current}
          setOpen(true)
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse') place(e)
        }}
        onPointerLeave={() => setOpen(false)}
      >
        {children}
      </Link>
      {hydrated
        ? createPortal(
            <div
              ref={cardRef}
              className={open ? 'cursor-card is-open' : 'cursor-card'}
              aria-hidden="true"
            >
              {image ? (
                <Img
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="240px"
                  className="cursor-card-img"
                />
              ) : null}
              <p className="text-small text-neutral-600">{description}</p>
            </div>,
            document.querySelector('main') ?? document.body,
          )
        : null}
    </>
  )
}
