import {ActionBar, WhatsAppFloat} from '@/components/layout/ActionBar'
import {getSettings} from '@/lib/content'
import {telHref, whatsappHref} from '@/lib/contact'

/** Mobile action bar + desktop floating WhatsApp button, with this page's prefilled message. */
export async function ContactDock({message}: {message: string}) {
  const settings = await getSettings()
  const wa = whatsappHref(settings.whatsappE164, message)
  return (
    <>
      <ActionBar tel={telHref(settings.phoneE164)} whatsapp={wa} />
      <WhatsAppFloat href={wa} />
    </>
  )
}
