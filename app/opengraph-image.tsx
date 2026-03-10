import { ImageResponse } from 'next/og'

export const alt = 'South by AI — AI-Powered SXSW Schedule Builder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 60,
          backgroundColor: '#0A0A0A',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 20,
              color: '#00D4AA',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            South by AI
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#F5F5F5',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Your SXSW,
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #FF6B35, #00D4AA)',
              backgroundClip: 'text',
              color: '#FF6B35',
            }}
          >
            Actually Planned
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 32 }}>
            60-second quiz. 4,000+ sessions. Your personalized SXSW 2026 schedule, built by&nbsp;AI.
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              width: '100%',
              background: 'linear-gradient(90deg, #FF6B35, #00D4AA)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
