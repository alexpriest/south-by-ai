'use client'

import { useState, useMemo } from 'react'
import type { DaySchedule, ScheduleSession } from '@/lib/types'
import { TimelineBlock } from './timeline-block'
import { SessionPopover } from './session-popover'
import { parseTime, findOverlapGroups } from '@/lib/schedule-utils'

interface TimelineViewProps {
  day: DaySchedule
  onSwap?: (sessionId: string) => void
}

const PX_PER_HOUR = 80
const START_HOUR = 9
const END_HOUR = 24
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const CONTAINER_HEIGHT = (END_HOUR - START_HOUR) * PX_PER_HOUR
const START_MINUTES = START_HOUR * 60

function isSXSWDate(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const start = new Date('2026-03-12T00:00:00')
  const end = new Date('2026-03-22T23:59:59')
  return d >= start && d <= end
}

const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

export function TimelineView({ day, onSwap }: TimelineViewProps) {
  const [popover, setPopover] = useState<{ session: ScheduleSession; rect: DOMRect } | null>(null)
  const overlapGroups = useMemo(() => findOverlapGroups(day.sessions), [day.sessions])

  if (day.sessions.length === 0) {
    return (
      <p className="text-muted text-center py-12">
        Nothing here yet. Hit &quot;Refine with AI&quot; to add sessions to this day.
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

  return (
    <div className="relative overflow-hidden" style={{ height: CONTAINER_HEIGHT }}>
      {/* Hour grid lines and labels */}
      {hours.map((hour) => {
        const top = ((hour - START_HOUR) * 60 / TOTAL_MINUTES) * 100
        return (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{ top: `${top}%` }}
          >
            <span className="absolute -top-2 left-0 w-12 text-xs text-muted/70 tabular-nums">
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
        {overlapGroups.map((group) => {
          const sorted = [...group].sort(
            (a, b) => (a.priority || 2) - (b.priority || 2)
          )

          return sorted.map((session, indexInGroup) => {
            const startMin = parseTime(session.startTime)
            const endMin = parseTime(session.endTime)
            const duration = endMin - startMin

            const top = ((startMin - START_MINUTES) / TOTAL_MINUTES) * 100
            const height = (duration / TOTAL_MINUTES) * 100

            const groupSize = sorted.length
            const isTopPick = groupSize > 1 && indexInGroup === 0

            // Layout: top pick gets more space, alts stack in remaining column
            // Max 2 visible alts — keeps it readable
            let widthPercent: number
            let leftPercent: number
            if (groupSize === 1) {
              widthPercent = 100
              leftPercent = 0
            } else if (isTopPick) {
              widthPercent = 55
              leftPercent = 0
            } else {
              // Alts share the remaining 45%, max 2 columns
              const visibleAlts = Math.min(groupSize - 1, 2)
              const altIndex = Math.min(indexInGroup - 1, 1)
              widthPercent = 45 / visibleAlts
              leftPercent = 55 + altIndex * widthPercent
              // Hide 3rd+ alts
              if (indexInGroup > 2) return null
            }

            return (
              <TimelineBlock
                key={session.id}
                session={session}
                isTopPick={isTopPick}
                compact={!isTopPick && groupSize > 1}
                onClick={() => {
                  const el = document.getElementById(`timeline-block-${session.id}`)
                  if (el) {
                    setPopover({ session, rect: el.getBoundingClientRect() })
                  }
                }}
                onSwap={onSwap ? () => onSwap(session.id) : undefined}
                style={{
                  top: `${top}%`,
                  height: `${height}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  minHeight: 44,
                }}
              />
            )
          })
        })}
      </div>

      {/* Session popover */}
      {popover && (
        <SessionPopover
          session={popover.session}
          anchorRect={popover.rect}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  )
}
