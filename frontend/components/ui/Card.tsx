import clsx from 'clsx'
import Link from 'next/link'
import type {ReactNode} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'

/**
 * Card (CLAUDE.md §7): 20/24px padding, 12px radius, media fixed at 16:10 and clipped to the
 * card radius, equal heights per row, call to action pinned to the bottom. The title link
 * covers the whole card while keeping one link in the accessibility tree.
 */
export function Card({
  href,
  title,
  text,
  media,
  icon,
  cta,
  headingLevel = 3,
  tone = 'light',
  className,
}: {
  href?: string
  title: string
  text?: string | null
  media?: ReactNode
  icon?: IconName
  cta?: string
  headingLevel?: 2 | 3
  tone?: 'light' | 'dark'
  className?: string
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-md border shadow-sm transition',
        href &&
          'hover:-translate-y-1 hover:shadow-md focus-within:-translate-y-1 focus-within:shadow-md',
        tone === 'dark'
          ? 'border-ink-700 bg-ink-800 text-cream'
          : 'border-neutral-200 bg-white text-ink-900',
        className,
      )}
      data-reveal
    >
      {media !== undefined ? (
        <div className="aspect-card overflow-hidden bg-neutral-100">{media}</div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-card">
        {icon ? (
          <span
            className={clsx(
              'mb-1 inline-grid size-icon-tile place-items-center rounded-sm',
              tone === 'dark' ? 'bg-accent text-ink-900' : 'bg-ink-900 text-accent',
            )}
          >
            <Icon name={icon} />
          </span>
        ) : null}
        <Heading
          className={clsx('text-h3 font-bold', tone === 'dark' ? 'text-cream' : 'text-ink-900')}
        >
          {href ? (
            <Link href={href} className="stretched-link no-underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        {text ? (
          <p className={tone === 'dark' ? 'text-cream-muted' : 'text-neutral-600'}>{text}</p>
        ) : null}
        {cta ? (
          <div className="mt-auto pt-2">
            <span
              aria-hidden="true"
              className={clsx(
                'inline-flex min-h-tap items-center gap-2 font-semibold',
                tone === 'dark' ? 'text-accent' : 'text-navy',
              )}
            >
              {cta}
              <Icon
                name="arrow-right"
                size="sm"
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

/** Neutral striped frame shown until a real photo is supplied (never a stock photo). */
export function PhotoPlaceholder({label}: {label?: string}) {
  return (
    <div
      className="photo-placeholder grid size-full place-items-center p-3 text-center text-xs font-semibold text-neutral-600"
      role="img"
      aria-label={label ? `Photo coming soon: ${label}` : 'Photo coming soon'}
    >
      <span aria-hidden="true">{label ? `Photo: ${label}` : ''}</span>
    </div>
  )
}
