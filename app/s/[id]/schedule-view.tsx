'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DayView } from '@/components/schedule/day-view'
import { TimelineView } from '@/components/schedule/timeline-view'
import { ShareButton } from '@/components/schedule/share-button'
import type { StoredSchedule } from '@/lib/types'

interface ScheduleViewProps {
  schedule: StoredSchedule
}

export function ScheduleView({ schedule }: ScheduleViewProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const activeDay = schedule.days[activeDayIndex]

  const dayLabels = schedule.days.map((d) => {
    const date = new Date(d.date + 'T12:00:00')
    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${day} ${date.getDate()}`
  })

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider mb-1">SXSW 2026</p>
              <h1 className="font-heading text-3xl font-bold">
                {schedule.name}&apos;s SXSW Schedule
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* View toggle */}
              <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'timeline'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
              <ShareButton scheduleId={schedule.id} />
              <Link
                href={`/s/${schedule.id}/refine`}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Refine with AI
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-end mb-4">
          <a
            href="https://schedule.sxsw.com/2026/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            Browse All Sessions on SXSW &rarr;
          </a>
        </div>
        {schedule.days.length > 0 && (
          <>
            {/* Day tabs */}
            <nav aria-label="Schedule days" className="flex gap-1.5 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {dayLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDayIndex(i)}
                  aria-pressed={i === activeDayIndex}
                  className={`rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition-all duration-200 ${
                    i === activeDayIndex
                      ? 'bg-primary text-white shadow-[0_0_16px_rgba(255,107,53,0.2)]'
                      : 'bg-white/5 text-muted hover:bg-white/10 hover:text-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {activeDay && (
              viewMode === 'timeline'
                ? <TimelineView day={activeDay} />
                : <DayView day={activeDay} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
