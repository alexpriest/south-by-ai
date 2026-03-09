'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DayView } from '@/components/schedule/day-view'
import { TimelineView } from '@/components/schedule/timeline-view'
import { MapView } from '@/components/schedule/map-view'
import { ShareButton } from '@/components/schedule/share-button'
import type { StoredSchedule } from '@/lib/types'

interface ScheduleViewProps {
  schedule: StoredSchedule
}

export function ScheduleView({ schedule }: ScheduleViewProps) {
  const [currentSchedule, setCurrentSchedule] = useState(schedule)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'map'>('timeline')
  const [isOwner, setIsOwner] = useState(false)
  const activeDay = currentSchedule.days[activeDayIndex]

  useEffect(() => {
    const secret = localStorage.getItem(`editSecret:${schedule.id}`)
    setIsOwner(!!secret)
  }, [schedule.id])

  const handleSwap = async (dayDate: string, sessionId: string) => {
    const editSecret = localStorage.getItem(`editSecret:${currentSchedule.id}`) || ''
    const res = await fetch(`/api/schedule/${currentSchedule.id}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayDate, sessionId, editSecret }),
    })
    if (res.ok) {
      const { schedule: updated } = await res.json()
      setCurrentSchedule(updated)
    }
  }

  const dayLabels = currentSchedule.days.map((d) => {
    const date = new Date(d.date + 'T12:00:00')
    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${day} ${date.getDate()}`
  })

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-accent uppercase tracking-wider mb-1">SXSW 2026</p>
                <h1 className="font-heading text-3xl font-bold">
                  {currentSchedule.name}&apos;s SXSW Schedule
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-3 flex-wrap">
                {/* View toggle — desktop */}
                <div role="group" aria-label="View mode" className="flex rounded-full bg-white/5 border border-white/10 p-1">
                  <button
                    onClick={() => setViewMode('timeline')}
                    aria-pressed={viewMode === 'timeline'}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      viewMode === 'timeline'
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    <svg aria-hidden="true" className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    <svg aria-hidden="true" className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    aria-pressed={viewMode === 'map'}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      viewMode === 'map'
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    <svg aria-hidden="true" className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Map
                  </button>
                </div>
                <a
                  href={`/api/calendar/${currentSchedule.id}`}
                  download="sxsw-schedule.ics"
                  className="group flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-muted border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200"
                  title="Download schedule as calendar file"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Export to Calendar
                </a>
                <ShareButton scheduleId={currentSchedule.id} scheduleName={currentSchedule.name} />
                {isOwner && (
                  <Link
                    href={`/s/${currentSchedule.id}/refine`}
                    className="bg-primary text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Refine with AI
                  </Link>
                )}
                <Link
                  href="/"
                  className="group flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-muted border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200"
                  title="Start over with a new quiz"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start Over
                </Link>
              </div>
            </div>
            {/* Mobile controls */}
            <div className="flex flex-col gap-3 sm:hidden">
              {/* View toggle — full width on mobile */}
              <div role="group" aria-label="View mode" className="flex rounded-full bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  aria-pressed={viewMode === 'timeline'}
                  className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'timeline'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  aria-pressed={viewMode === 'map'}
                  className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Map
                </button>
              </div>
              {/* Action buttons — row on mobile */}
              <div className="flex items-center gap-2">
                {isOwner && (
                  <Link
                    href={`/s/${currentSchedule.id}/refine`}
                    className="flex-1 bg-primary text-white rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
                  >
                    Refine with AI
                  </Link>
                )}
                <a
                  href={`/api/calendar/${currentSchedule.id}`}
                  download="sxsw-schedule.ics"
                  className="group flex items-center justify-center rounded-full w-10 h-10 text-muted border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200"
                  title="Export to Calendar"
                >
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </a>
                <ShareButton scheduleId={currentSchedule.id} scheduleName={currentSchedule.name} />
                <Link
                  href="/"
                  className="group flex items-center justify-center rounded-full w-10 h-10 text-muted border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200"
                  title="Start over with a new quiz"
                >
                  <svg aria-hidden="true" className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences breadcrumbs */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-muted/80 shrink-0">Built around:</span>
          {currentSchedule.preferences.interests.map((interest) => (
            <span key={interest} className="bg-white/5 text-muted px-2.5 py-1 rounded-full">
              {interest}
            </span>
          ))}
          {currentSchedule.preferences.vibes.map((vibe) => (
            <span key={vibe} className="bg-primary/10 text-primary/80 px-2.5 py-1 rounded-full">
              {vibe}
            </span>
          ))}
          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-full">
            {currentSchedule.preferences.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`mx-auto px-4 md:px-8 py-8 ${viewMode === 'map' ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="flex justify-end mb-4">
          <a
            href="https://schedule.sxsw.com/2026/search/event"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            Browse all sessions on sxsw.com &rarr;
          </a>
        </div>
        {currentSchedule.days.length > 0 && (
          <>
            {/* Day tabs */}
            <nav aria-label="Schedule days" role="tablist" className="flex gap-1.5 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {dayLabels.map((label, i) => (
                <button
                  key={i}
                  id={`day-tab-${i}`}
                  role="tab"
                  onClick={() => setActiveDayIndex(i)}
                  aria-selected={i === activeDayIndex}
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
                ? <TimelineView day={activeDay} onSwap={isOwner ? (sessionId) => handleSwap(activeDay.date, sessionId) : undefined} />
                : viewMode === 'map'
                ? <MapView day={activeDay} />
                : <DayView day={activeDay} onSwap={isOwner ? (sessionId) => handleSwap(activeDay.date, sessionId) : undefined} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
