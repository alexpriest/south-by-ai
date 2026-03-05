'use client'

import type { DaySchedule, ScheduleSession } from '@/lib/types'
import { TimelineBlock } from './timeline-block'

interface TimelineViewProps {
  day: DaySchedule
}

const START_HOUR = 9
const END_HOUR = 23
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60 // 840
const CONTAINER_HEIGHT = 840 // 60px per hour
const START_MINUTES = START_HOUR * 60 // 540

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function findOverlapGroups(sessions: ScheduleSession[]): ScheduleSession[][] {
  const sorted = [...sessions].sort(
    (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
  )

  const groups: ScheduleSession[][] = []
  let currentGroup: ScheduleSession[] = []
  let groupEnd = 0

  for (const session of sorted) {
    const start = parseTime(session.startTime)
    const end = parseTime(session.endTime)

    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(session)
      groupEnd = Math.max(groupEnd, end)
    } else {
      groups.push(currentGroup)
      currentGroup = [session]
      groupEnd = end
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

function isSXSWDate(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const start = new Date('2026-03-13T00:00:00')
  const end = new Date('2026-03-22T23:59:59')
  return d >= start && d <= end
}

const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

export function TimelineView({ day }: TimelineViewProps) {
  if (day.sessions.length === 0) {
    return (
      <p className="text-muted text-center py-12">
        Nothing scheduled for this day. Hit &quot;Refine&quot; to add sessions.
      </p>
    )
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const isToday = day.date === todayStr
  const showCurrentTime = isToday && isSXSWDate(day.date)

  let currentTimePercent: number | null = null
  if (showCurrentTime) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    if (nowMinutes >= START_MINUTES && nowMinutes <= START_MINUTES + TOTAL_MINUTES) {
      currentTimePercent = ((nowMinutes - START_MINUTES) / TOTAL_MINUTES) * 100
    }
  }

  const overlapGroups = findOverlapGroups(day.sessions)

  return (
    <div className="relative" style={{ height: CONTAINER_HEIGHT }}>
      {/* Hour grid lines and labels */}
      {hours.map((hour) => {
        const top = ((hour - START_HOUR) * 60 / TOTAL_MINUTES) * 100
        return (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{ top: `${top}%` }}
          >
            <span className="absolute -top-2 left-0 w-12 text-xs text-muted">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        )
      })}

      {/* Current time indicator */}
      {currentTimePercent !== null && (
        <div
          className="absolute left-12 right-0 z-20 pointer-events-none"
          style={{ top: `${currentTimePercent}%` }}
        >
          <div className="h-0.5 bg-primary" />
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
        </div>
      )}

      {/* Session blocks */}
      <div className="absolute left-14 right-0 top-0 bottom-0">
        {overlapGroups.map((group) =>
          group.map((session, indexInGroup) => {
            const startMin = parseTime(session.startTime)
            const endMin = parseTime(session.endTime)
            const duration = endMin - startMin

            const top = ((startMin - START_MINUTES) / TOTAL_MINUTES) * 100
            const height = (duration / TOTAL_MINUTES) * 100

            const groupSize = group.length
            const widthPercent = 100 / groupSize
            const leftPercent = indexInGroup * widthPercent

            return (
              <TimelineBlock
                key={session.id}
                session={session}
                style={{
                  top: `${top}%`,
                  height: `${height}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  minHeight: 40,
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
