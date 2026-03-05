'use client'

import { useState, useMemo } from 'react'
import type { Session } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface SessionListProps {
  sessions: Session[]
  showTrack?: boolean
}

function formatDateHeading(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function SessionList({ sessions, showTrack }: SessionListProps) {
  const eventTypes = useMemo(() => {
    const types = new Set<string>()
    for (const s of sessions) types.add(s.type)
    return Array.from(types).sort()
  }, [sessions])

  const dates = useMemo(() => {
    const d = new Set<string>()
    for (const s of sessions) d.add(s.date)
    return Array.from(d).sort()
  }, [sessions])

  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedType && s.type !== selectedType) return false
      if (selectedDate && s.date !== selectedDate) return false
      return true
    })
  }, [sessions, selectedType, selectedDate])

  const grouped = useMemo(() => {
    const map = new Map<string, Session[]>()
    for (const s of filtered) {
      const list = map.get(s.date) || []
      list.push(s)
      map.set(s.date, list)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-text focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
        >
          <option value="">All Types</option>
          {eventTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-text focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
        >
          <option value="">All Dates</option>
          {dates.map((d) => (
            <option key={d} value={d}>{formatDateHeading(d)}</option>
          ))}
        </select>

        {(selectedType || selectedDate) && (
          <button
            onClick={() => { setSelectedType(''); setSelectedDate('') }}
            className="text-sm text-muted hover:text-accent transition-colors px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-muted mb-6">
        {filtered.length} session{filtered.length !== 1 ? 's' : ''}
      </p>

      {grouped.map(([date, dateSessions]: [string, Session[]]) => (
        <div key={date} className="mb-8">
          <h2 className="font-heading text-xl font-bold mb-4 text-text/80">
            {formatDateHeading(date)}
          </h2>
          <div className="space-y-3">
            {dateSessions.map((session: Session) => (
              <a
                key={session.id}
                href={session.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
              >
                <h3 className="font-heading text-base font-bold group-hover:text-primary transition-colors">
                  {session.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                  <span className="text-text/70">
                    {session.startTime} &ndash; {session.endTime}
                  </span>
                  {session.venue && (
                    <span className="text-muted">{session.venue}</span>
                  )}
                  <span
                    className="font-medium"
                    style={{ color: getTrackColor(session.track) }}
                  >
                    {session.format}
                  </span>
                  {showTrack && (
                    <span className="text-accent">{session.track}</span>
                  )}
                </div>
                {session.speakers.length > 0 && (
                  <p className="text-xs text-muted mt-2">
                    {session.speakers.join(', ')}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <p className="text-muted text-center py-12">
          No sessions match your filters.
        </p>
      )}
    </div>
  )
}
