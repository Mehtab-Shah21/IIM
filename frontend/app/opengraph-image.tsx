import {ImageResponse} from 'next/og'

/** Default share image (1200 × 630), used when a page has no CMS share image. */
export const alt = 'IIM Technical Services: electrical, plumbing and maintenance in Dubai'
export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#1a1a1a',
        padding: 72,
        color: '#f5f0de',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div
          style={{
            background: '#e6b215',
            color: '#1a1a1a',
            fontSize: 56,
            fontWeight: 800,
            padding: '8px 20px',
            borderRadius: 12,
          }}
        >
          IIM
        </div>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase'}}>
          Technical Services
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{fontSize: 68, fontWeight: 800, lineHeight: 1.1}}>
          Electricians, plumbers and handymen in Dubai.
        </div>
        <div style={{fontSize: 40, fontWeight: 700, color: '#ffb800'}}>
          Your property, our priority.
        </div>
      </div>
      <div style={{fontSize: 28, color: '#c9c3ad'}}>Book in 3 steps · Pay after the service</div>
    </div>,
    size,
  )
}
