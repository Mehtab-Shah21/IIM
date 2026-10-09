import {Icon} from '@/components/icons/Icon'

/** Hidden fields shared by both forms: type, honeypot, timing, page and campaign. */
export function HiddenFields({type, plan}: {type: 'quote' | 'amc'; plan?: string}) {
  return (
    <>
      <input type="hidden" name="type" value={type} />
      {plan ? <input type="hidden" name="plan" value={plan} /> : null}
      <input type="hidden" name="startedAt" defaultValue="1" />
      <input type="hidden" name="pageUrl" defaultValue="" />
      <input type="hidden" name="utmSource" defaultValue="" />
      <input type="hidden" name="utmMedium" defaultValue="" />
      <input type="hidden" name="utmCampaign" defaultValue="" />
      {/* Honeypot: hidden from people and assistive tech, filled by naive bots. */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  )
}

/** Without JavaScript, show every step and the plain submit button. */
export function NoScriptSteps() {
  return (
    <noscript>
      <style>{`.form-step{display:grid!important}.form-nav,.form-progress{display:none!important}.nojs-submit{display:block!important}`}</style>
    </noscript>
  )
}

export function FormAlert({
  message,
  fallbackRef,
}: {
  message?: string | null
  fallbackRef?: string | null
}) {
  if (!message) return null
  return (
    <div
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-3 rounded-sm bg-error-bg p-4 font-medium text-error"
    >
      <Icon name="triangle-alert" size="sm" className="mt-1" />
      <span>
        {message}
        {fallbackRef ? <strong className="block">Reference: {fallbackRef}</strong> : null}
      </span>
    </div>
  )
}
