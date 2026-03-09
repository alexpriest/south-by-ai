'use client'

import { useState } from 'react'
import type { DaySchedule } from '@/lib/types'
import { SessionCard } from './session-card'
import { findOverlapGroups } from '@/lib/schedule-utils'

interface DayViewProps {
  day: DaySchedule
  onSwap?: (sessionId: string) => void
}

export function DayView({ day, onSwap }: DayViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  if (day.sessions.length === 0) {
    return (
      <p className="text-muted text-center py-12">
        Nothing here yet. Hit &quot;Refine with AI&quot; to add sessions to this day.
      </p>
    )
  }

  const groups = findOverlapGroups(day.sessions)

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group, groupIndex) => {
        if (group.length === 1) {
          return (
            <SessionCard
              key={group[0].id}
              session={group[0]}
              onSwap={onSwap ? () => onSwap(group[0].id) : undefined}
            />
          )
        }

        const sorted = [...group].sort(
          (a, b) => (a.priority || 2) - (b.priority || 2)
        )
        const topPick = sorted[0]
        const alternatives = sorted.slice(1)
        const isExpanded = expandedGroups.has(groupIndex)

        const startTime = group.reduce(
          (min, s) => (s.startTime < min ? s.startTime : min),
          group[0].startTime
        )
        const endTime = group.reduce(
          (max, s) => (s.endTime > max ? s.endTime : max),
          group[0].endTime
        )

        return (
          <div key={topPick.id}>
            <p className="text-sm font-medium text-muted mb-2">
              {startTime} &ndash; {endTime}
            </p>
            <SessionCard
              session={topPick}
              onSwap={onSwap ? () => onSwap(topPick.id) : undefined}
            />
            <button
              onClick={() => toggleGroup(groupIndex)}
              aria-expanded={isExpanded}
              className="text-xs text-muted hover:text-muted mt-1 ml-4 transition-colors"
            >
              {isExpanded
                ? `Hide ${alternatives.length} alternative${alternatives.length > 1 ? 's' : ''}`
                : `${alternatives.length} alternative${alternatives.length > 1 ? 's' : ''}`}
            </button>
            {isExpanded && (
              <div className="ml-4 opacity-80 flex flex-col gap-3.5 mt-2">
                {alternatives.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onSwap={onSwap ? () => onSwap(session.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
