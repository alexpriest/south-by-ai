import type { DaySchedule } from '@/lib/types'
import { SessionCard } from './session-card'

interface DayViewProps {
  day: DaySchedule
  onSwap?: (sessionId: string) => void
}

export function DayView({ day, onSwap }: DayViewProps) {
  if (day.sessions.length === 0) {
    return (
      <p className="text-muted text-center py-12">
        Nothing scheduled for this day. Hit &quot;Refine&quot; to add sessions.
      </p>
    )
  }

  let shownHint = false

  return (
    <div className="flex flex-col gap-3.5">
      {day.sessions.map((session) => {
        const isAlt = (session.priority || 2) !== 1
        const showHint = isAlt && !shownHint && onSwap
        if (showHint) shownHint = true

        return (
          <div key={session.id}>
            <SessionCard session={session} onSwap={onSwap ? () => onSwap(session.id) : undefined} />
            {showHint && (
              <p className="text-[11px] text-muted/60 mt-1.5 ml-4 italic">
                Tap &quot;Promote&quot; on any alternative to make it your top pick for that time slot.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
