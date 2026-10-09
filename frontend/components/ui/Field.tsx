import clsx from 'clsx'
import type {ComponentProps, ReactNode} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'

/**
 * Form fields (CLAUDE.md §7): label always visible, 48px controls, 8px radius, 16px+ text
 * (no iOS zoom), errors linked with aria-describedby and announced.
 */
const control =
  'block w-full min-h-control rounded-sm border border-neutral-600 bg-white px-4 py-3 text-body leading-tight text-ink-900 transition-colors hover:border-ink-900 focus-visible:border-ink-900 aria-invalid:border-2 aria-invalid:border-error'

type FieldShell = {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  optionalNote?: string
  className?: string
  children: ReactNode
}

export function Field({id, label, hint, error, required, optionalNote, className, children}: FieldShell) {
  return (
    <div className={clsx('grid min-w-0 gap-2', className)}>
      <label htmlFor={id} className="font-semibold text-ink-900">
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : optionalNote ? (
          <span className="text-small font-regular text-neutral-600"> ({optionalNote})</span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-small text-neutral-600">
          {hint}
        </p>
      ) : null}
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export function FieldError({id, message}: {id: string; message?: string}) {
  return (
    <p id={id} className={clsx('items-center gap-2 text-small font-semibold text-error', message ? 'flex' : 'hidden')}>
      <Icon name="triangle-alert" size="sm" />
      <span>{message}</span>
    </p>
  )
}

export function describedBy(id: string, hint?: unknown): string {
  return [hint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(' ')
}

export function TextInput({className, ...props}: ComponentProps<'input'>) {
  return <input className={clsx(control, className)} {...props} />
}

export function Textarea({className, ...props}: ComponentProps<'textarea'>) {
  return <textarea className={clsx(control, 'min-h-section resize-y leading-body', className)} {...props} />
}

export function Select({className, children, ...props}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={clsx(control, 'appearance-none pr-7', className)} {...props}>
        {children}
      </select>
      <Icon
        name="chevron-down"
        size="sm"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-900"
      />
    </div>
  )
}

export function Checkbox({
  label,
  id,
  error,
  ...props
}: {label: ReactNode; id: string; error?: string} & ComponentProps<'input'>) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex min-h-tap cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 size-icon shrink-0 accent-ink-900"
          aria-describedby={`${id}-error`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <span className="text-small">{label}</span>
      </label>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export type Choice = {value: string; label: string; icon?: IconName}

/** Radio "tiles" for short choices (service, time of day). */
export function ChoiceGroup({
  name,
  legend,
  options,
  value,
  defaultValue,
  onChange,
  error,
  required,
  columns = 2,
}: {
  name: string
  legend: ReactNode
  options: Choice[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  columns?: 2 | 3
}) {
  const errorId = `${name}-error`
  return (
    <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0" aria-describedby={errorId}>
      <legend className="mb-2 p-0 font-semibold text-ink-900">
        {legend}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </legend>
      <div className={clsx('grid grid-cols-1 gap-3 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
        {options.map((o) => (
          <label key={o.value} className="choice-tile">
            <input
              type="radio"
              name={name}
              value={o.value}
              className="sr-only"
              required={required}
              aria-invalid={error ? true : undefined}
              {...(value !== undefined
                ? {checked: value === o.value, onChange: () => onChange?.(o.value)}
                : {defaultChecked: defaultValue === o.value})}
            />
            {o.icon ? <Icon name={o.icon} size="sm" className="text-ink-900" /> : null}
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
