import Link from 'next/link'
import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'

interface SessionCardProps {
  session: ScheduleSession
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <a
      href={session.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${session.title} (opens in new tab)`}
      className="group block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold group-hover:text-primary transition-colors">
            {session.title}
          </h3>
          {session.description && (
            <p className="text-sm text-muted mt-1.5 line-clamp-2">{session.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs">
            <span className="text-text/70">{session.startTime} – {session.endTime}</span>
            {session.venue && <span className="text-muted">{session.venue}</span>}
            {session.track && (
              <Link
                href={`/browse/${encodeURIComponent(session.track)}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium hover:underline"
                style={{ color: getTrackColor(session.track) }}
              >
                {session.track}
              </Link>
            )}
          </div>
          {session.reason && (
            <p className="text-xs text-accent/80 mt-2 italic">{session.reason}</p>
          )}
          {session.speakers.length > 0 && (
            <p className="text-xs text-muted mt-1.5">
              {session.speakers.join(', ')}
            </p>
          )}
        </div>
        <svg className="w-4 h-4 text-muted/40 group-hover:text-muted transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  )
}
