import clsx from 'clsx'
import Link from 'next/link'

/** Text wordmark in the live site's black-and-gold style, until the SVG logo arrives (PLACEHOLDERS B1). */
export function Logo({name, tone = 'dark'}: {name: string; tone?: 'dark' | 'light'}) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 no-underline"
      aria-label={`${name}, home`}
    >
      <span
        aria-hidden="true"
        className="rounded-sm bg-gold px-2 py-1 font-heading text-h4 leading-none font-extrabold tracking-tight text-ink-900"
      >
        IIM
      </span>
      <span
        aria-hidden="true"
        className={clsx(
          'font-heading text-xs leading-tight font-bold tracking-wide uppercase',
          tone === 'dark' ? 'text-cream' : 'text-ink-900',
        )}
      >
        Technical
        <br />
        Services
      </span>
    </Link>
  )
}
