/**
 * Enables draft mode for the Sanity Presentation tool (visual editing). Validates the preview
 * secret with the viewer token; returns 404 when Sanity is not configured.
 */
import {NextResponse} from 'next/server'
import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {makeClient} from '@/lib/sanity/client'

const token = process.env.SANITY_API_READ_TOKEN

export const GET =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && token
    ? defineEnableDraftMode({client: makeClient().withConfig({token})}).GET
    : () => NextResponse.json({ok: false, message: 'Draft mode is not configured'}, {status: 404})
