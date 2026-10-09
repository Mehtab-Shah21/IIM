import '@/styles/globals.css'

import type {Metadata, Viewport} from 'next'
import {Inter, Plus_Jakarta_Sans} from 'next/font/google'
import {draftMode} from 'next/headers'

import {Enhancements} from '@/components/layout/Enhancements'
import {Footer} from '@/components/layout/Footer'
import {Header} from '@/components/layout/Header'
import {getAreas, getPublishedPageKeys, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {isSanityConfigured, publicEnv, siteUrl} from '@/lib/env'

// Self-hosted at build time, Latin subset, size-adjusted fallbacks (no layout shift).
const jakarta = Plus_Jakarta_Sans({subsets: ['latin'], variable: '--font-jakarta', display: 'swap'})
const inter = Inter({subsets: ['latin'], variable: '--font-inter', display: 'swap'})

const isLive = process.env.SITE_ENV === 'production'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Staging and local builds are never indexed (the proxy also sends X-Robots-Tag).
  robots: isLive ? undefined : {index: false, follow: false},
  formatDetection: {telephone: false},
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a1a1a',
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const [settings, services, areas, publishedKeys, draft] = await Promise.all([
    getSettings(),
    getServices(),
    getAreas(),
    getPublishedPageKeys(),
    draftMode(),
  ])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage

  let live: React.ReactNode = null
  if (isSanityConfigured) {
    const {SanityLive} = await import('@/lib/sanity/live')
    live = <SanityLive />
  }
  let visualEditing: React.ReactNode = null
  if (isSanityConfigured && draft.isEnabled) {
    const {VisualEditing} = await import('next-sanity/visual-editing')
    visualEditing = <VisualEditing />
  }

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="skip-link focus-on-accent rounded-sm bg-accent px-5 py-3 font-semibold text-ink-900 no-underline"
        >
          Skip to content
        </a>
        <Header settings={settings} services={services} whatsappMessage={message} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer settings={settings} services={services} areas={areas} publishedKeys={publishedKeys} whatsappMessage={message} />
        <Enhancements gaId={publicEnv.NEXT_PUBLIC_GA_ID} />
        {live}
        {visualEditing}
      </body>
    </html>
  )
}
