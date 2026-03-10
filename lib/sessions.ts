import { unstable_cache } from 'next/cache'
import type { Session, Speaker } from './types'
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

function transformSession(hit: SXSWHit, personMap: Map<string, string>): Session {
  const s = hit._source
  const tags = s.links
    .filter((l) => l.label === 'Tag')
    .map((l) => l.value)

  const venueName = s.venue
    ? s.venue.name !== s.venue.root
      ? `${s.venue.name}, ${s.venue.root}`
      : s.venue.name
    : ''

  const speakers: Speaker[] = (s.panelists || []).map((name) => ({
    name,
    url: personMap.get(name) ||
      `https://schedule.sxsw.com/2026/search/speaker?q=${encodeURIComponent(name)}`,
  }))

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
    speakers,
    url: `https://schedule.sxsw.com/2026/events/${s.event_id}`,
    tags,
    imageUrl: s.thumbnail_url || null,
    badgeTypes: s.primary_credentials || [],
  }
}

interface SXSWPersonSource {
  name: string
  entity_id: number
}

interface SXSWPersonHit {
  _source: SXSWPersonSource
}

interface SXSWPersonResponse {
  hits: SXSWPersonHit[]
}

async function getSXSWAuth(): Promise<{ csrfToken: string; sessionCookie: string }> {
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

  return { csrfToken, sessionCookie }
}

async function fetchSXSWPersons(
  csrfToken: string,
  sessionCookie: string,
): Promise<Map<string, string>> {
  const res = await fetch('https://schedule.sxsw.com/2026/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({ term: '', filters: [], models: ['person'] }),
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) return new Map()

  const data: SXSWPersonResponse = await res.json()
  const map = new Map<string, string>()
  for (const hit of data.hits) {
    const { name, entity_id } = hit._source
    map.set(name, `https://schedule.sxsw.com/2026/contributors/${entity_id}`)
  }
  return map
}

async function fetchSXSWEvents(): Promise<Session[]> {
  const { csrfToken, sessionCookie } = await getSXSWAuth()

  const [personMap, searchRes] = await Promise.all([
    fetchSXSWPersons(csrfToken, sessionCookie),
    fetch('https://schedule.sxsw.com/2026/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': sessionCookie,
      },
      body: JSON.stringify({ term: '', filters: [], models: ['event'] }),
      signal: AbortSignal.timeout(5000),
    }),
  ])

  if (!searchRes.ok) {
    throw new Error(`SXSW API returned ${searchRes.status}`)
  }

  const data: SXSWResponse = await searchRes.json()
  return data.hits.map((hit) => transformSession(hit, personMap))
}

export const getSessions = unstable_cache(
  async (): Promise<Session[]> => {
    try {
      const raw = await fetchSXSWEvents()
      const live = raw.filter(s => s.date.startsWith('2026-'))
      if (live.length > 0) {
        console.log(`Fetched ${live.length} sessions from SXSW live (filtered ${raw.length - live.length} with invalid dates)`)
        return live
      }
    } catch (e) {
      console.warn('Live SXSW scrape failed, using fallback:', e instanceof Error ? e.message : e)
    }
    const valid = (fallbackSessions as Session[]).filter(s => s.date.startsWith('2026-'))
    console.log(`Using ${valid.length} fallback sessions (filtered ${fallbackSessions.length - valid.length} with invalid dates)`)
    return valid
  },
  ['sxsw-sessions'],
  { revalidate: 900 }
)
