'use client'

import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface SessionCardProps {
  session: ScheduleSession
  onSwap?: () => void
}

export function SessionCard({ session, onSwap }: SessionCardProps) {
  const isTopPick = (session.priority || 2) === 1
  const isAlt = !isTopPick
  const trackColor = getTrackColor(session.track)

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${session.title} (opens in new tab)`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a, button')) return
        window.open(session.url, '_blank', 'noopener,noreferrer')
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !(e.target as HTMLElement).closest('a, button')) {
          window.open(session.url, '_blank', 'noopener,noreferrer')
        }
      }}
      style={{ borderLeftColor: trackColor }}
      className={`group block border-l-[3px] bg-s1 backdrop-blur-md border-t border-r border-b border-b1 rounded-xl p-5 hover:bg-sh hover:border-b2 transition-all duration-200 cursor-pointer ${
        isAlt ? 'opacity-60' : ''
      }`}
    >
      {isTopPick && (
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-caption font-semibold text-primary uppercase tracking-wider">Top Pick</span>
        </div>
      )}
      {isAlt && onSwap && (
        <button
          type="button"
          className="text-xs text-muted hover:text-primary transition-colors cursor-pointer flex items-center gap-1 mb-2 bg-transparent border-none p-0 min-h-[44px]"
          onClick={(e) => { e.stopPropagation(); onSwap(); }}
          aria-label={`Make "${session.title}" your top pick`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Make this my pick</span>
        </button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold group-hover:text-primary transition-colors">
            {session.title}
          </h3>
          {session.description && (
            <p className="text-sm text-muted mt-1.5 line-clamp-2">{session.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs">
            <span className="text-text-secondary">{session.startTime} – {session.endTime}</span>
            {session.venue && <span className="text-muted">{session.venue}</span>}
            {session.track && (
              <span
                className="font-medium"
                style={{ color: getTrackColor(session.track) }}
              >
                {session.track}
              </span>
            )}
          </div>
          {session.reason && (
            <p className="text-xs text-accent-readable mt-2 italic">{session.reason}</p>
          )}
          {session.speakers.length > 0 && (
            <p className="text-xs text-muted mt-1.5">
              {session.speakers.map((speaker, i) => (
                <span key={speaker.name}>
                  {i > 0 && ', '}
                  <a
                    href={speaker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="text-accent-readable hover:underline"
                  >
                    {speaker.name}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <svg className="w-4 h-4 text-muted group-hover:text-muted transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </div>
  )
}
