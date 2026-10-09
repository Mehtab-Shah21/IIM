import type {MetadataRoute} from 'next'

import {getSettings} from '@/lib/content'
import {siteUrl} from '@/lib/env'

const disallow = ['/api/', '/style-guide/', '/thank-you/', '/search']

/**
 * Search and answer crawlers are always allowed. Training crawlers follow the
 * "Allow AI training crawlers" switch in Sanity (owner decision, PLACEHOLDERS C1).
 * Staging is closed to every crawler.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (process.env.SITE_ENV !== 'production') {
    return {rules: [{userAgent: '*', disallow: '/'}]}
  }
  const settings = await getSettings()
  const training = ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Applebot-Extended']
  return {
    rules: [
      {
        userAgent: ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot'],
        allow: '/',
        disallow,
      },
      settings.allowAiTraining === false
        ? {userAgent: training, disallow: '/'}
        : {userAgent: training, allow: '/', disallow},
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
