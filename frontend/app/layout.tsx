import '@/styles/globals.css'

import type {Metadata, Viewport} from 'next'
import localFont from 'next/font/local'
import {draftMode} from 'next/headers'

import {Enhancements} from '@/components/layout/Enhancements'
import {Footer} from '@/components/layout/Footer'
import {Header} from '@/components/layout/Header'
import {getAreas, getPublishedPageKeys, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {isSanityConfigured, publicEnv, siteUrl} from '@/lib/env'

// Self-hosted, trimmed to the weights and characters the site uses (scripts/subset-fonts.py,
// ADR-005), with size-adjusted fallbacks (no layout shift). Characters outside the subset fall
// back to the metric-matched system font. Options must be literals (next/font), hence the repetition.
const jakarta = localFont({
  src: '../fonts/jakarta-latin-700-800.woff2',
  weight: '700 800',
  variable: '--font-jakarta',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0020-007E, U+00A0-00FF, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2039-203A, U+20AC, U+2122, U+2190-2193, U+2212, U+2248',
    },
  ],
})
const inter = localFont({
  src: '../fonts/inter-latin-400-700.woff2',
  weight: '400 700',
  variable: '--font-inter',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0020-007E, U+00A0-00FF, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2039-203A, U+20AC, U+2122, U+2190-2193, U+2212, U+2248',
    },
  ],
})

const isLive = process.env.SITE_ENV === 'production'

// Visitor's saved choice (components/layout/ThemeToggle.tsx), otherwise the system setting.
const themeScript = `try{var t=localStorage.getItem('iim-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}`

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
  themeColor: '#1a1a1a', // token: --ink-900 (meta tags need a literal colour)
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
    // suppressHydrationWarning: the theme script below sets data-theme before React hydrates.
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint, so a dark-theme visitor never sees a light flash. */}
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
      </head>
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
        <Footer
          settings={settings}
          services={services}
          areas={areas}
          publishedKeys={publishedKeys}
          whatsappMessage={message}
        />
        <Enhancements gaId={publicEnv.NEXT_PUBLIC_GA_ID} />
        {live}
        {visualEditing}
      </body>
    </html>
  )
}
