'use client'

/**
 * Three-step quote form (CLAUDE.md §12). With JavaScript: one step at a time with inline
 * validation. Without JavaScript: the <noscript> style shows every step as one long form that
 * posts straight to /api/quote. Steps 2 and 3 are hidden by CSS from the first paint, so
 * hydration causes no layout shift.
 */
import clsx from 'clsx'
import {useState} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'
import {Button} from '@/components/ui/Button'
import {Checkbox, ChoiceGroup, Field, Select, TextInput, Textarea, describedBy} from '@/components/ui/Field'
import {addDays, dubaiToday, emirates, preferredTimeLabels, preferredTimes, quoteSteps} from '@/lib/forms/constants'
import {routes} from '@/lib/routes'

import {FormAlert, HiddenFields, NoScriptSteps} from './shared'
import {Turnstile} from './Turnstile'
import {useLeadForm, type Errors} from './useLeadForm'

export type FormService = {slug: string; title: string; icon: IconName}

const stepLabels = ['The job', 'Where and when', 'Your details']

export function QuoteForm({
  services,
  preselect,
  siteKey,
  initialErrors,
  initialMessage,
  privacyHref,
}: {
  services: FormService[]
  preselect?: string
  siteKey?: string
  initialErrors?: Errors
  initialMessage?: string
  privacyHref?: string
}) {
  const {formRef, errors, message, fallbackRef, submitting, submit, validate, resetSignal} = useLeadForm('quote', initialErrors)
  const [step, setStep] = useState(() => firstStepWithError(initialErrors))
  const slugs = services.map((s) => s.slug)
  const today = dubaiToday()

  const go = async (next: number) => {
    if (next > step && !(await validate(quoteSteps[step]!, slugs))) return
    setStep(next)
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-step="${next}"] legend`)?.focus())
  }

  const onSubmit = async (e: React.FormEvent) => {
    const errs = await submit(e, slugs)
    if (errs && Object.keys(errs).length) setStep(firstStepWithError(errs))
  }

  return (
    <form ref={formRef} id="form" method="post" action="/api/quote" noValidate onSubmit={onSubmit} className="grid gap-5" data-track-zone="quote-form">
      <NoScriptSteps />
      <HiddenFields type="quote" />
      <FormAlert message={message ?? initialMessage} fallbackRef={fallbackRef} />

      <ol className="form-progress m-0 flex list-none gap-2 p-0" aria-label="Form progress">
        {stepLabels.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? 'step' : undefined}
            className={clsx(
              'grid flex-1 gap-2 text-xs font-semibold',
              i === step ? 'text-ink-900' : 'text-neutral-600',
            )}
          >
            <span className={clsx('block h-1 rounded-pill', i <= step ? 'bg-ink-900' : 'bg-neutral-200')} />
            {label}
          </li>
        ))}
      </ol>

      <fieldset className={clsx('form-step m-0 grid min-w-0 gap-5 border-0 p-0', step === 0 && 'is-active')} data-step={0}>
        <legend tabIndex={-1} className="mb-4 p-0 font-heading text-h4 font-bold text-ink-900">
          1. What do you need?
        </legend>
        <ChoiceGroup
          name="service"
          legend="Service"
          required
          columns={3}
          defaultValue={preselect}
          error={errors.service}
          options={[...services.map((s) => ({value: s.slug, label: s.title, icon: s.icon})), {value: 'other', label: 'Something else', icon: 'clipboard-list' as IconName}]}
        />
        <Field
          id="q-description"
          label="Describe the job"
          required
          hint='For example: "Kitchen sink leaking under the cabinet since yesterday" or "Six ceiling lights to change in a villa".'
          error={errors.description}
        >
          <Textarea
            id="q-description"
            name="description"
            required
            minLength={10}
            maxLength={1000}
            aria-describedby={describedBy('q-description', true)}
            aria-invalid={errors.description ? true : undefined}
          />
        </Field>
        <p className="flex items-start gap-2 text-small text-neutral-600">
          <Icon name="camera" size="sm" className="mt-1" />
          You can send photos or a short video on WhatsApp after you submit. Your reference number will be in the message.
        </p>
      </fieldset>

      <fieldset className={clsx('form-step m-0 grid min-w-0 gap-5 border-0 p-0', step === 1 && 'is-active')} data-step={1}>
        <legend tabIndex={-1} className="mb-4 p-0 font-heading text-h4 font-bold text-ink-900">
          2. Where and when?
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="q-emirate" label="Emirate" required error={errors.emirate}>
            <Select id="q-emirate" name="emirate" defaultValue="Dubai" required aria-describedby={describedBy('q-emirate')}>
              {emirates.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="q-area" label="Area or community" required error={errors.area}>
            <TextInput
              id="q-area"
              name="area"
              required
              minLength={2}
              maxLength={80}
              autoComplete="address-level2"
              aria-describedby={describedBy('q-area')}
              aria-invalid={errors.area ? true : undefined}
            />
          </Field>
          <Field id="q-address" label="Building or street" optionalNote="optional" error={errors.address} className="sm:col-span-2">
            <TextInput id="q-address" name="address" maxLength={200} autoComplete="street-address" aria-describedby={describedBy('q-address')} />
          </Field>
          <Field id="q-date" label="Preferred date" required error={errors.preferredDate}>
            <TextInput
              id="q-date"
              name="preferredDate"
              type="date"
              required
              min={today}
              max={addDays(today, 60)}
              aria-describedby={describedBy('q-date')}
              aria-invalid={errors.preferredDate ? true : undefined}
            />
          </Field>
          <div className="sm:col-span-2">
            <ChoiceGroup
              name="preferredTime"
              legend="Preferred time"
              required
              defaultValue="asap"
              error={errors.preferredTime}
              options={preferredTimes.map((t) => ({value: t, label: preferredTimeLabels[t]}))}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={clsx('form-step m-0 grid min-w-0 gap-5 border-0 p-0', step === 2 && 'is-active')} data-step={2}>
        <legend tabIndex={-1} className="mb-4 p-0 font-heading text-h4 font-bold text-ink-900">
          3. Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="q-name" label="Full name" required error={errors.name} className="sm:col-span-2">
            <TextInput id="q-name" name="name" required minLength={2} maxLength={80} autoComplete="name" aria-describedby={describedBy('q-name')} aria-invalid={errors.name ? true : undefined} />
          </Field>
          <Field id="q-phone" label="Mobile number" required hint="UAE number. We use it to confirm your visit." error={errors.phone}>
            <TextInput
              id="q-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              maxLength={20}
              autoComplete="tel"
              placeholder="050 123 4567"
              aria-describedby={describedBy('q-phone', true)}
              aria-invalid={errors.phone ? true : undefined}
            />
          </Field>
          <Field id="q-email" label="Email" optionalNote="optional, for a written confirmation" error={errors.email}>
            <TextInput id="q-email" name="email" type="email" maxLength={150} autoComplete="email" aria-describedby={describedBy('q-email')} aria-invalid={errors.email ? true : undefined} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox
              id="q-consent"
              name="consent"
              required
              error={errors.consent}
              label={
                <>
                  I agree that IIM Technical Services may contact me by phone, WhatsApp or email about this request and keep my details as
                  described in the{' '}
                  <a href={privacyHref ?? routes.privacy} className="text-navy underline">
                    privacy policy
                  </a>
                  .
                </>
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Turnstile siteKey={siteKey} formRef={formRef} resetSignal={resetSignal} />
          </div>
        </div>
      </fieldset>

      <div className="form-nav flex flex-wrap justify-between gap-3">
        {step > 0 ? (
          <Button variant="secondary" icon="chevron-left" onClick={() => go(step - 1)}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <Button variant="primary" iconAfter="chevron-right" onClick={() => go(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="submit" variant="primary" loading={submitting}>
            Send my request
          </Button>
        )}
      </div>
      <div className="nojs-submit">
        <Button type="submit" variant="primary" block>
          Send my request
        </Button>
      </div>
    </form>
  )
}

function firstStepWithError(errors?: Errors): number {
  if (!errors) return 0
  const i = quoteSteps.findIndex((fields) => fields.some((f) => errors[f]))
  return i === -1 ? 0 : i
}
