'use client'

import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface TimelineBlockProps {
  session: ScheduleSession
  style: React.CSSProperties
  isTopPick?: boolean
  compact?: boolean
  onClick?: () => void
  onSwap?: () => void
}

export function TimelineBlock({ session, style, isTopPick, compact, onClick, onSwap }: TimelineBlockProps) {
  const trackColor = getTrackColor(session.track)
  const isAlternative = !isTopPick && (session.priority || 2) >= 2

  return (
    <div
      id={`timeline-block-${session.id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      style={{
        ...style,
        borderLeftColor: trackColor,
      }}
      className={`absolute text-left border-l-[3px] rounded-r-lg px-3 py-1.5 transition-all duration-200 overflow-hidden cursor-pointer group ${
        isAlternative
          ? 'bg-ss border-t border-r border-b border-b1 opacity-50 hover:opacity-80 hover:bg-s1'
          : 'bg-s1 backdrop-blur-md border-t border-r border-b border-b1 hover:bg-sh'
      }`}
    >
      {/* Top pick: full detail */}
      {!compact && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-micro text-muted tabular-nums shrink-0">
              {session.startTime} – {session.endTime}
            </span>
            {isTopPick && (
              <svg className="w-3 h-3 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
          <h4 className="text-[13px] font-heading font-bold text-text leading-snug mt-0.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {session.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: trackColor }}
            />
            <span className="text-micro text-muted truncate">
              {session.track}
              {session.venue && ` · ${session.venue.split(',')[0]}`}
            </span>
          </div>
        </div>
      )}

      {/* Alternative: minimal — just title + track dot */}
      {compact && (
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            {onSwap && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSwap(); }}
                className="bg-transparent border-none p-0 cursor-pointer"
                aria-label={`Make "${session.title}" your top pick`}
              >
                <svg
                  className="w-3 h-3 text-muted hover:text-primary shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            )}
            <h4 className="text-[12px] font-medium text-text-secondary leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {session.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: trackColor }}
            />
            <span className="text-micro text-muted truncate">{session.track}</span>
          </div>
        </div>
      )}
    </div>
  )
}
