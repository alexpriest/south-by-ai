import { ImageResponse } from '@vercel/og'
import { getCachedSchedule } from '@/lib/kv'
import { getTrackColor } from '@/lib/track-colors'

export const runtime = 'edge'
export const alt = 'South by AI - Your SXSW Schedule'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let schedule
  try {
    schedule = await getCachedSchedule(id)
  } catch {
    // fall through to fallback
  }

  if (!schedule) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0A0A0A',
            color: '#F5F5F5',
            fontSize: 48,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          South by AI
        </div>
      ),
      {
        ...size,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  }

  const totalSessions = schedule.days.reduce(
    (sum, d) => sum + d.sessions.filter(s => s.priority === 1).length,
    0
  )
  const totalDays = schedule.days.length

  const trackCounts: Record<string, number> = {}
  schedule.days.forEach(d =>
    d.sessions.forEach(s => {
      if (s.priority === 1 && s.track) {
        trackCounts[s.track] = (trackCounts[s.track] || 0) + 1
      }
    })
  )
  const topTracks = Object.entries(trackCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
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
              textTransform: 'uppercase' as const,
              marginBottom: 24,
            }}
          >
            South by AI
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#F5F5F5',
              lineHeight: 1.1,
              marginBottom: 32,
            }}
          >
            {`${schedule.name}'s SXSW Schedule — Built by AI`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
          {topTracks.map((track) => (
            <div
              key={track}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '8px 20px',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: getTrackColor(track),
                }}
              />
              <span style={{ fontSize: 18, color: '#F5F5F5' }}>{track}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 22, color: '#6B7280' }}>
            {totalSessions} sessions across {totalDays} days
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #FF6B35, #FF8F65, #00D4AA)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
