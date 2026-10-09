import clsx from 'clsx'
import Link from 'next/link'
import type {ComponentProps, ReactNode} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost'
export type ButtonTone = 'light' | 'dark'

/** Shared button classes (CLAUDE.md §7: 48px min height, 24px padding, 8px radius, weight 600). */
export function buttonClasses({
  variant = 'primary',
  tone = 'light',
  block = false,
  size = 'default',
  className,
}: {
  variant?: ButtonVariant
  tone?: ButtonTone
  block?: boolean
  size?: 'default' | 'bar'
  className?: string
}) {
  // Never pass display or min-height overrides in className: they conflict with these base
  // classes. Wrap the button for responsive visibility, use `size` for the compact action bar.
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-sm',
    size === 'bar' ? 'h-full px-2 py-1 text-small' : 'min-h-control px-5 py-3 text-body',
    'text-center font-semibold leading-tight no-underline transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
    block && 'w-full',
    variant === 'primary' && 'focus-on-accent bg-accent text-ink-900 hover:bg-accent-600',
    variant === 'whatsapp' && 'focus-on-accent bg-whatsapp text-ink-900 hover:bg-whatsapp-600',
    variant === 'secondary' &&
      (tone === 'dark'
        ? 'border border-cream bg-transparent text-cream hover:bg-ink-800'
        : 'border border-ink-900 bg-white text-ink-900 hover:bg-neutral-100'),
    variant === 'ghost' &&
      (tone === 'dark'
        ? 'bg-transparent text-cream hover:bg-ink-800'
        : 'bg-transparent text-ink-900 hover:bg-neutral-100'),
    className,
  )
}

type Common = {
  variant?: ButtonVariant
  tone?: ButtonTone
  block?: boolean
  icon?: IconName
  iconAfter?: IconName
  children: ReactNode
}

export function Button({
  variant,
  tone,
  block,
  icon,
  iconAfter,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: Common & {loading?: boolean} & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(buttonClasses({variant, tone, block, className}), loading && 'relative')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="size-icon-sm animate-spin rounded-pill border-2 border-current border-r-transparent" />
        </span>
      ) : null}
      <span className={clsx('inline-flex items-center gap-2', loading && 'opacity-0')}>
        {icon ? <Icon name={icon} size="sm" /> : null}
        {children}
        {iconAfter ? <Icon name={iconAfter} size="sm" /> : null}
      </span>
    </button>
  )
}

/** A link styled as a button. External and tel:/mailto: links use a plain anchor. */
export function ButtonLink({
  href,
  variant,
  tone,
  block,
  icon,
  iconAfter,
  className,
  children,
  external,
  ...rest
}: Common & {href: string; external?: boolean} & Omit<ComponentProps<'a'>, 'href'>) {
  const classes = buttonClasses({variant, tone, block, className})
  const content = (
    <>
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size="sm" /> : null}
    </>
  )
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  )
}

/** Text link with an arrow that nudges on hover. */
export function ArrowLink({
  href,
  children,
  tone = 'light',
}: {
  href: string
  children: ReactNode
  tone?: ButtonTone
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'group inline-flex min-h-tap items-center gap-2 font-semibold no-underline',
        tone === 'dark' ? 'text-accent' : 'text-navy',
      )}
    >
      {children}
      <Icon
        name="arrow-right"
        size="sm"
        className="transition-transform group-hover:translate-x-1"
      />
    </Link>
  )
}
