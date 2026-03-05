'use client'

import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface TimelineBlockProps {
  session: ScheduleSession
  style: React.CSSProperties
  isTopPick?: boolean
  onClick?: () => void
  onSwap?: () => void
}

export function TimelineBlock({ session, style, isTopPick, onClick, onSwap }: TimelineBlockProps) {
  const trackColor = getTrackColor(session.track)
  const isAlternative = !isTopPick && (session.priority || 2) >= 2

  return (
    <button
      id={`timeline-block-${session.id}`}
      onClick={onClick}
      style={{
        ...style,
        borderLeftColor: trackColor,
      }}
      className={`absolute text-left border-l-[3px] bg-white/5 backdrop-blur-md border-t border-r border-b border-white/10 rounded-r-lg px-3 py-2 hover:bg-white/[0.08] transition-all duration-200 overflow-hidden cursor-pointer group ${
        isAlternative ? 'opacity-60 hover:opacity-90' : ''
      }`}
    >
      {onSwap && !isTopPick && (session.priority || 2) >= 2 && (
        <button
          onClick={(e) => { e.stopPropagation(); onSwap(); }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-primary/20 hover:bg-primary/30 transition-all z-10"
          title="Make this your top pick"
        >
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted leading-none">
            {session.startTime} &ndash; {session.endTime}
          </p>
          <h4 className="text-sm font-heading font-bold text-text leading-tight mt-0.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {isTopPick && (
              <svg className="inline-block w-3.5 h-3.5 text-primary mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {session.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {session.track && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  color: trackColor,
                  backgroundColor: `${trackColor}20`,
                }}
              >
                {session.track}
              </span>
            )}
            {isTopPick && (
              <span className="text-[10px] font-medium text-primary">Top Pick</span>
            )}
            {session.venue && (
              <span className="text-[11px] text-muted truncate max-w-[200px]">{session.venue}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
