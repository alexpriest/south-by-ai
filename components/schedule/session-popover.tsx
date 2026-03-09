'use client'

import { useEffect, useRef } from 'react'
import type { ScheduleSession } from '@/lib/types'
import { getTrackColor } from '@/lib/track-colors'
import { getSpeakerUrl } from '@/lib/speaker-url'

interface SessionPopoverProps {
  session: ScheduleSession
  anchorRect: DOMRect
  onClose: () => void
}

export function SessionPopover({ session, anchorRect, onClose }: SessionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const trackColor = getTrackColor(session.track)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Position: below block by default, flip above if not enough space
  const popoverWidth = Math.min(360, window.innerWidth - 16)
  const gap = 8
  const spaceBelow = window.innerHeight - anchorRect.bottom
  const placeAbove = spaceBelow < 280 && anchorRect.top > 280

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    width: popoverWidth,
    maxHeight: 400,
    left: Math.min(
      Math.max(8, anchorRect.left),
      window.innerWidth - popoverWidth - 8
    ),
    ...(placeAbove
      ? { bottom: window.innerHeight - anchorRect.top + gap }
      : { top: anchorRect.bottom + gap }),
  }

  return (
    <div
      ref={ref}
      style={style}
      tabIndex={-1}
      role="dialog"
      aria-label={session.title}
      className="popover-enter bg-background border border-b1 rounded-xl shadow-xl overflow-y-auto p-5"
    >
      <p className="text-xs text-muted">
        {session.startTime} &ndash; {session.endTime}
        {session.venue && <> &middot; {session.venue}</>}
      </p>

      <h3 className="font-heading text-base font-bold text-text mt-1.5 leading-tight">
        {session.title}
      </h3>

      {session.track && (
        <span
          className="inline-block text-caption font-medium px-2 py-0.5 rounded-full mt-2"
          style={{
            color: trackColor,
            backgroundColor: `${trackColor}20`,
          }}
        >
          {session.track}
        </span>
      )}

      {session.description && (
        <p className="text-sm text-muted mt-3 leading-relaxed">{session.description}</p>
      )}

      {session.speakers.length > 0 && (
        <div className="mt-3">
          <p className="text-caption text-muted uppercase tracking-wider mb-1">Speakers</p>
          <div className="flex flex-wrap gap-1.5">
            {session.speakers.map((speaker) => (
              <a
                key={speaker}
                href={getSpeakerUrl(speaker)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-readable hover:underline"
              >
                {speaker}
              </a>
            ))}
          </div>
        </div>
      )}

      {session.reason && (
        <p className="text-xs text-accent-readable mt-3 italic border-t border-b1 pt-3">
          {session.reason}
        </p>
      )}

      <a
        href={session.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-3"
      >
        View on SXSW
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}
