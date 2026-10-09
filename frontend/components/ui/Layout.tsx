import clsx from 'clsx'
import type {ReactNode} from 'react'

export type Surface = 'white' | 'neutral' | 'cream' | 'dark' | 'darker'

const surfaces: Record<Surface, string> = {
  white: 'bg-white text-ink-900',
  neutral: 'bg-neutral-50 text-ink-900',
  cream: 'bg-cream text-ink-900',
  dark: 'bg-ink-900 text-cream',
  darker: 'bg-ink-950 text-cream',
}

export const isDark = (surface: Surface) => surface === 'dark' || surface === 'darker'

/** Section with the uniform vertical rhythm (64px mobile, 96px from 1024px). */
export function Section({
  children,
  surface = 'white',
  wide = false,
  id,
  labelledBy,
  className,
}: {
  children: ReactNode
  surface?: Surface
  wide?: boolean
  id?: string
  labelledBy?: string
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={clsx('section', surfaces[surface], className)}>
      <div className={wide ? 'container-wide' : 'container-content'}>{children}</div>
    </section>
  )
}

/** Eyebrow, H2 and optional lead, with consistent spacing. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  center = false,
  tone = 'light',
  children,
}: {
  id?: string
  eyebrow?: string
  title: string
  lead?: string | null
  center?: boolean
  tone?: 'light' | 'dark'
  children?: ReactNode
}) {
  return (
    <div className={clsx('mb-7 grid max-w-prose gap-4', center && 'mx-auto justify-items-center text-center')}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className={clsx('text-h2 font-bold', tone === 'dark' ? 'text-cream' : 'text-ink-900')}>
        {title}
      </h2>
      {lead ? <p className={clsx('text-lead', tone === 'dark' ? 'text-cream-muted' : 'text-neutral-600')}>{lead}</p> : null}
      {children}
    </div>
  )
}

export function Eyebrow({children, tone = 'light'}: {children: ReactNode; tone?: 'light' | 'dark'}) {
  return (
    <p
      className={clsx(
        'font-heading text-small font-bold tracking-wide uppercase',
        tone === 'dark' ? 'text-accent' : 'text-navy',
      )}
    >
      {children}
    </p>
  )
}

export function Badge({children, tone = 'accent'}: {children: ReactNode; tone?: 'accent' | 'neutral'}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold',
        tone === 'accent' ? 'bg-accent text-ink-900' : 'bg-neutral-100 text-ink-900',
      )}
    >
      {children}
    </span>
  )
}

export function Chip({children}: {children: ReactNode}) {
  return (
    <span className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-neutral-100 px-3 py-1 text-small font-semibold text-ink-900">
      {children}
    </span>
  )
}
