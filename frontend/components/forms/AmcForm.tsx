'use client'

/** Annual maintenance contract application (short variant): name, phone, emirate, location, property type, consent. */
import {Button} from '@/components/ui/Button'
import {Checkbox, Field, Select, TextInput, describedBy} from '@/components/ui/Field'
import {emirates, propertyTypeLabels, propertyTypes} from '@/lib/forms/constants'
import {routes} from '@/lib/routes'

import {FormAlert, HiddenFields} from './shared'
import {Turnstile} from './Turnstile'
import {useLeadForm, type Errors} from './useLeadForm'

export function AmcForm({
  idPrefix = 'amc',
  plan,
  siteKey,
  initialErrors,
  initialMessage,
  privacyHref,
}: {
  idPrefix?: string
  plan?: 'residential' | 'commercial'
  siteKey?: string
  initialErrors?: Errors
  initialMessage?: string
  privacyHref?: string
}) {
  const {formRef, errors, message, fallbackRef, submitting, submit, resetSignal} = useLeadForm(
    'amc',
    initialErrors,
  )
  const id = (f: string) => `${idPrefix}-${f}`
  const types =
    plan === 'commercial' ? (['office', 'retail', 'building', 'other'] as const) : propertyTypes

  return (
    <form
      ref={formRef}
      method="post"
      action="/api/quote"
      noValidate
      onSubmit={(e) => submit(e)}
      className="grid gap-5"
      data-track-zone="amc-form"
    >
      <HiddenFields type="amc" plan={plan} />
      <FormAlert message={message ?? initialMessage} fallbackRef={fallbackRef} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={id('name')}
          label="Full name"
          required
          error={errors.name}
          className="sm:col-span-2"
        >
          <TextInput
            id={id('name')}
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            aria-describedby={describedBy(id('name'))}
            aria-invalid={errors.name ? true : undefined}
          />
        </Field>
        <Field id={id('phone')} label="Mobile number" required error={errors.phone}>
          <TextInput
            id={id('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={20}
            autoComplete="tel"
            placeholder="050 123 4567"
            aria-describedby={describedBy(id('phone'))}
            aria-invalid={errors.phone ? true : undefined}
          />
        </Field>
        <Field id={id('emirate')} label="Emirate" required error={errors.emirate}>
          <Select
            id={id('emirate')}
            name="emirate"
            defaultValue="Dubai"
            required
            aria-describedby={describedBy(id('emirate'))}
          >
            {emirates.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={id('area')} label="Area or building" required error={errors.area}>
          <TextInput
            id={id('area')}
            name="area"
            required
            minLength={2}
            maxLength={80}
            aria-describedby={describedBy(id('area'))}
            aria-invalid={errors.area ? true : undefined}
          />
        </Field>
        <Field id={id('property')} label="Property type" required error={errors.propertyType}>
          <Select
            id={id('property')}
            name="propertyType"
            required
            defaultValue=""
            aria-describedby={describedBy(id('property'))}
            aria-invalid={errors.propertyType ? true : undefined}
          >
            <option value="" disabled>
              Choose…
            </option>
            {types.map((t) => (
              <option key={t} value={t}>
                {propertyTypeLabels[t]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Checkbox
            id={id('consent')}
            name="consent"
            required
            error={errors.consent}
            label={
              <>
                I agree to be contacted about an annual contract and to my details being kept as
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
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary" block loading={submitting}>
            Apply for a contract
          </Button>
        </div>
      </div>
    </form>
  )
}
