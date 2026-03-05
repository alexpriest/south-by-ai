import { ImageResponse } from '@vercel/og'
import { getSchedule } from '@/lib/kv'

export const runtime = 'edge'
export const alt = 'South by AI - Your SXSW Schedule'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: { id: string } }) {
  const schedule = await getSchedule(params.id)

  const name = schedule?.name || 'Someone'
  const sessionCount = schedule?.days.reduce((sum, d) => sum + d.sessions.length, 0) || 0
  const dayCount = schedule?.days.length || 0

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#0A0A0A',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              color: '#00D4AA',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            SXSW 2026
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#F5F5F5',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            {`${name}'s SXSW Schedule — Built by AI`}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '32px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '24px',
                color: '#FF6B35',
              }}
            >
              {sessionCount} sessions
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '24px',
                color: '#6B7280',
              }}
            >
              {dayCount} days
            </div>
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#6B7280',
              marginTop: '24px',
            }}
          >
            Built with South by AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
