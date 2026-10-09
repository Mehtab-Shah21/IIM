import clsx from 'clsx'

import {lucide, whatsappPath, type LucideName} from './paths'

export type IconName = LucideName | 'whatsapp'

const sizes = {sm: 'size-icon-sm', md: 'size-icon', lg: 'size-icon-lg'} as const

type IconProps = {
  name: IconName
  size?: keyof typeof sizes
  className?: string
  /** Accessible label. Omit for decorative icons (the default). */
  label?: string
}

/** Inline SVG icon (server-rendered, no JavaScript). */
export function Icon({name, size = 'md', className, label}: IconProps) {
  const a11y = label ? {role: 'img', 'aria-label': label} : {'aria-hidden': true, focusable: false}
  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" className={clsx(sizes[size], 'shrink-0', className)} {...a11y}>
        <path fill="currentColor" d={whatsappPath} />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx(sizes[size], 'shrink-0', className)}
      {...a11y}
      // Geometry is generated from the Lucide package at build time (paths.ts), never user input.
      dangerouslySetInnerHTML={{__html: lucide[name]}}
    />
  )
}

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && (value === 'whatsapp' || value in lucide)
}
