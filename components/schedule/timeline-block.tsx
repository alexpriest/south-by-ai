'use client'

import { useState } from 'react'
import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface TimelineBlockProps {
  session: ScheduleSession
  style: React.CSSProperties
}

export function TimelineBlock({ session, style }: TimelineBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const trackColor = getTrackColor(session.track)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      style={{
        ...style,
        borderLeftColor: trackColor,
      }}
      className="absolute text-left border-l-[3px] bg-white/5 backdrop-blur-md border-t border-r border-b border-white/10 rounded-r-lg px-3 py-2 hover:bg-white/[0.08] transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted">
            {session.startTime} - {session.endTime}
          </p>
          <h4 className="text-sm font-heading font-bold text-text leading-tight mt-0.5 group-hover:text-primary transition-colors">
            {session.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {session.venue && (
              <span className="text-[11px] text-muted truncate">{session.venue}</span>
            )}
            {session.track && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  color: trackColor,
                  backgroundColor: `${trackColor}20`,
                }}
              >
                {session.track}
              </span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/10">
          {session.description && (
            <p className="text-xs text-muted leading-relaxed">{session.description}</p>
          )}
          {session.speakers.length > 0 && (
            <p className="text-xs text-text/70 mt-1.5">
              {session.speakers.join(', ')}
            </p>
          )}
          {session.reason && (
            <p className="text-xs text-accent/80 mt-1.5 italic">{session.reason}</p>
          )}
        </div>
      )}
    </button>
  )
}
