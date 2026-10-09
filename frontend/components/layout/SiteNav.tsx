'use client'

/**
 * Primary navigation, Services mega menu and mobile drawer.
 * Client component because it needs the current path, open/close state and focus handling.
 * The drawer is a native <dialog> (focus trap, Escape and inert background come from the
 * browser). Without JavaScript the menu button links to the footer navigation.
 */
import clsx from 'clsx'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useId, useRef, useState} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'
import {buttonClasses} from '@/components/ui/Button'

import {ThemeToggle} from './ThemeToggle'

export type NavService = {title: string; href: string; icon: IconName; summary?: string | null}
export type NavItem = {label: string; href: string; match: string; mega?: boolean}

export function SiteNav({
  items,
  services,
  quoteHref,
  telHref,
  phoneDisplay,
  whatsappHref,
}: {
  items: NavItem[]
  services: NavService[]
  quoteHref: string
  telHref: string | null
  phoneDisplay: string
  whatsappHref: string | null
}) {
  const pathname = usePathname() ?? '/'
  const isCurrent = (match: string) =>
    match === '/' ? pathname === '/' : pathname.startsWith(match)

  return (
    <>
      <DesktopNav items={items} services={services} isCurrent={isCurrent} />
      <div className="flex items-center gap-2 xl:gap-3">
        <ThemeToggle />
        {telHref ? (
          <div className="hidden lg:block">
            <a
              href={telHref}
              className={buttonClasses({variant: 'secondary', tone: 'dark'})}
              data-track="phone_click"
              data-track-location="header"
            >
              <Icon name="phone" size="sm" />
              {/* The number fits beside the full menu only from 1440 px; icon-only below that. */}
              <span className="hidden 2xl:inline">{phoneDisplay}</span>
              <span className="sr-only 2xl:hidden">Call {phoneDisplay}</span>
            </a>
          </div>
        ) : null}
        <div className="hidden md:block">
          <Link
            href={quoteHref}
            className={buttonClasses({variant: 'primary'})}
            data-track="cta_click"
            data-track-location="header"
          >
            Get a Quote
          </Link>
        </div>
        <MobileDrawer
          items={items}
          services={services}
          isCurrent={isCurrent}
          quoteHref={quoteHref}
          telHref={telHref}
          phoneDisplay={phoneDisplay}
          whatsappHref={whatsappHref}
        />
      </div>
    </>
  )
}

function DesktopNav({
  items,
  services,
  isCurrent,
}: {
  items: NavItem[]
  services: NavService[]
  isCurrent: (m: string) => boolean
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  return (
    <nav aria-label="Primary" className="hidden h-full lg:block">
      <ul className="m-0 flex h-full list-none items-stretch p-0">
        {items.map((item) => {
          const current = isCurrent(item.match)
          const link = (
            <Link
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={clsx(
                'inline-flex min-h-tap items-center rounded-sm px-2 font-medium whitespace-nowrap text-cream xl:px-3 no-underline hover:text-accent',
                current && 'text-accent underline decoration-2 underline-offset-8',
              )}
            >
              {item.label}
            </Link>
          )
          if (!item.mega || !services.length) {
            return (
              <li key={item.href} className="flex items-center">
                {link}
              </li>
            )
          }
          return (
            <li
              key={item.href}
              ref={wrapRef}
              className="group/mega flex items-center"
              onKeyDown={(e) => {
                if (e.key === 'Escape' && open) {
                  setOpen(false)
                  ;(e.currentTarget.querySelector('button') as HTMLButtonElement | null)?.focus()
                }
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
              }}
            >
              {link}
              <button
                type="button"
                className="-ml-3 inline-grid size-tap place-items-center rounded-sm text-cream hover:text-accent"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
              >
                <Icon
                  name="chevron-down"
                  size="sm"
                  className={clsx('transition-transform', open && 'rotate-180')}
                />
                <span className="sr-only">Show services</span>
              </button>
              <div
                id={panelId}
                className={clsx(
                  'mega-panel absolute inset-x-0 top-full border-t border-ink-700 bg-ink-900 py-6 shadow-lg',
                  open && 'is-open',
                )}
              >
                <div className="container-wide">
                  <ul className="m-0 grid list-none grid-cols-4 gap-4 p-0">
                    {services.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 rounded-md p-3 text-cream no-underline hover:bg-ink-800"
                        >
                          <span className="inline-grid size-icon-tile place-items-center rounded-sm bg-accent text-ink-900">
                            <Icon name={s.icon} />
                          </span>
                          <span>
                            <span className="block font-heading font-bold text-cream">
                              {s.title}
                            </span>
                            {s.summary ? (
                              <span className="block text-small text-cream-muted">{s.summary}</span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MobileDrawer({
  items,
  services,
  isCurrent,
  quoteHref,
  telHref,
  phoneDisplay,
  whatsappHref,
}: {
  items: NavItem[]
  services: NavService[]
  isCurrent: (m: string) => boolean
  quoteHref: string
  telHref: string | null
  phoneDisplay: string
  whatsappHref: string | null
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    ref.current?.close()
  }, [pathname])

  const open = (e: React.MouseEvent) => {
    e.preventDefault()
    ref.current?.showModal()
  }
  const close = () => ref.current?.close()

  return (
    <>
      <a
        href="#footer-nav"
        onClick={open}
        role="button"
        aria-haspopup="dialog"
        className="inline-grid size-control place-items-center rounded-sm border border-ink-700 text-cream lg:hidden"
      >
        <Icon name="menu" />
        <span className="sr-only">Open menu</span>
      </a>
      <dialog
        ref={ref}
        aria-label="Menu"
        className="drawer"
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="flex h-full flex-col bg-white text-ink-900">
          <div className="flex min-h-header items-center justify-between border-b border-neutral-200 px-gutter">
            <span className="font-heading text-h4 font-bold">Menu</span>
            <button
              type="button"
              onClick={close}
              className="inline-grid size-control place-items-center rounded-sm border border-neutral-200"
              autoFocus
            >
              <Icon name="x" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter py-4">
            <ul className="m-0 list-none p-0">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isCurrent(item.match) ? 'page' : undefined}
                    className={clsx(
                      'flex min-h-control items-center border-b border-neutral-200 py-2 text-lead font-semibold no-underline',
                      isCurrent(item.match) && 'text-navy',
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.mega ? (
                    <ul className="m-0 list-none py-2 pl-4">
                      {services.map((s) => (
                        <li key={s.href}>
                          <Link
                            href={s.href}
                            onClick={close}
                            className="flex min-h-tap items-center gap-3 py-1 font-medium text-neutral-600 no-underline"
                          >
                            <Icon name={s.icon} size="sm" className="text-ink-900" />
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          <div className="drawer-foot grid gap-3 border-t border-neutral-200 px-gutter pt-4">
            <Link
              href={quoteHref}
              onClick={close}
              className={buttonClasses({variant: 'primary', block: true})}
            >
              Get a Quote
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({variant: 'whatsapp', block: true})}
                data-track="whatsapp_click"
                data-track-location="drawer"
              >
                <Icon name="whatsapp" size="sm" />
                WhatsApp Us
              </a>
            ) : null}
            {telHref ? (
              <a
                href={telHref}
                className={buttonClasses({variant: 'secondary', block: true})}
                data-track="phone_click"
                data-track-location="drawer"
              >
                <Icon name="phone" size="sm" />
                {phoneDisplay}
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  )
}
