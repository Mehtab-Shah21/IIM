import type {CSSProperties} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'

/**
 * Row of contact tiles: each shows a letter and flips to its icon when the row is hovered or
 * focused, with a label tooltip and a light sweeping along the frame. Adapted from the
 * owner-supplied "SocialFlipButton", rebuilt in CSS (no Framer Motion, no react-icons):
 * - every tile is a real link with an accessible name;
 * - on touch screens (no hover) the icons and labels show straight away;
 * - reduced motion: no flip animation or sweeping light.
 */
export type ContactTile = {
  letter: string
  label: string
  icon: IconName
  href: string
  external?: boolean
  track?: string
}

export function ContactFlip({tiles}: {tiles: ContactTile[]}) {
  if (!tiles.length) return null
  return (
    <div className="contact-flip">
      <span className="contact-flip-line contact-flip-line-top" aria-hidden="true" />
      <span className="contact-flip-line contact-flip-line-bottom" aria-hidden="true" />
      <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
        {tiles.map((t, i) => (
          <li key={t.label} className="grid justify-items-center gap-2">
            <a
              href={t.href}
              aria-label={t.label}
              className="contact-flip-tile"
              style={{'--i': i} as CSSProperties}
              {...(t.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
              {...(t.track ? {'data-track': t.track, 'data-track-location': 'contact_tiles'} : {})}
            >
              <span className="contact-flip-tip" aria-hidden="true">
                {t.label}
              </span>
              <span className="contact-flip-inner" aria-hidden="true">
                <span className="contact-flip-front">{t.letter}</span>
                <span className="contact-flip-back">
                  <Icon name={t.icon} />
                </span>
              </span>
            </a>
            <span className="contact-flip-label" aria-hidden="true">
              {t.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
