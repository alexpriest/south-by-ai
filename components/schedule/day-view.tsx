import type { DaySchedule } from '@/lib/types'
import { SessionCard } from './session-card'

interface DayViewProps {
  day: DaySchedule
}

export function DayView({ day }: DayViewProps) {
  if (day.sessions.length === 0) {
    return (
      <p className="text-muted text-center py-12">
        Nothing scheduled for this day. Hit &quot;Refine&quot; to add sessions.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {day.sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}
