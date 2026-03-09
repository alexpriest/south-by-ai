import { unstable_cache } from 'next/cache'
import type { Session } from './types'
import fallbackSessions from '@/data/sessions.json'

interface SXSWSource {
  name: string
  event_id: string
  theme: string | null
  event_type: string
  format: string | null
  date: string
  start_time: string
  end_time: string
  venue: { name: string; root: string } | null
  panelists: string[]
  links: { label: string; value: string }[]
  thumbnail_url: string | null
  primary_credentials: string[]
}

interface SXSWHit {
  _source: SXSWSource
}

interface SXSWResponse {
  hits: SXSWHit[]
}

function toLocalTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Chicago',
  })
}

function toLocalDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' })
}

function transformSession(hit: SXSWHit): Session {
  const s = hit._source
  const tags = s.links
    .filter((l) => l.label === 'Tag')
    .map((l) => l.value)

  const venueName = s.venue
    ? s.venue.name !== s.venue.root
      ? `${s.venue.name}, ${s.venue.root}`
      : s.venue.name
    : ''

  return {
    id: s.event_id,
    title: s.name,
    description: '',
    track: s.theme || 'General',
    type: s.event_type,
    format: s.format || s.event_type,
    date: toLocalDate(s.start_time),
    startTime: toLocalTime(s.start_time),
    endTime: toLocalTime(s.end_time),
    venue: venueName,
    speakers: s.panelists || [],
    url: `https://schedule.sxsw.com/2026/events/${s.event_id}`,
    tags,
    imageUrl: s.thumbnail_url || null,
    badgeTypes: s.primary_credentials || [],
  }
}

async function fetchSXSWEvents(): Promise<Session[]> {
  const pageRes = await fetch('https://schedule.sxsw.com/2026/search/event', {
    headers: { 'User-Agent': 'SouthByAI/1.0' },
    signal: AbortSignal.timeout(5000),
  })

  const cookies = pageRes.headers.getSetCookie?.() || []
  const sessionCookie = cookies
    .find((c) => c.startsWith('_chronos_session='))
    ?.split(';')[0] || ''

  const pageHtml = await pageRes.text()
  const csrfMatch = pageHtml.match(/csrf-token[^>]*content="([^"]*)"/)
  const csrfToken = csrfMatch?.[1] || ''

  if (!csrfToken || !sessionCookie) {
    throw new Error('Failed to get SXSW session/CSRF token')
  }

  const searchRes = await fetch('https://schedule.sxsw.com/2026/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({
      term: '',
      filters: [],
      models: ['event'],
    }),
    signal: AbortSignal.timeout(5000),
  })

  if (!searchRes.ok) {
    throw new Error(`SXSW API returned ${searchRes.status}`)
  }

  const data: SXSWResponse = await searchRes.json()
  return data.hits.map(transformSession)
}

export const getSessions = unstable_cache(
  async (): Promise<Session[]> => {
    try {
      const live = await fetchSXSWEvents()
      if (live.length > 0) {
        console.log(`Fetched ${live.length} sessions from SXSW live`)
        return live
      }
    } catch (e) {
      console.warn('Live SXSW scrape failed, using fallback:', e instanceof Error ? e.message : e)
    }
    console.log(`Using ${fallbackSessions.length} fallback sessions`)
    return fallbackSessions as Session[]
  },
  ['sxsw-sessions'],
  { revalidate: 900 }
)
