import type { Session } from './types'
import rawSessions from '@/data/sessions.json'

interface RawSpeaker {
  name: string
  title: string
  company: string
}

interface RawSession {
  id: string
  title: string
  description: string
  track: string
  format: string
  date: string
  startTime: string
  endTime: string
  venue: string
  speakers: RawSpeaker[]
  url: string
  tags: string[]
}

let cached: Session[] | null = null

export function getSessions(): Session[] {
  if (cached) return cached

  cached = (rawSessions as RawSession[]).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    track: s.track,
    format: s.format,
    date: s.date,
    start_time: s.startTime,
    end_time: s.endTime,
    venue: s.venue,
    speakers: s.speakers.map((sp) => sp.name),
    url: s.url,
    tags: s.tags,
  }))

  return cached
}
