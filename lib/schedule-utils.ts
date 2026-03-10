import type { ScheduleSession } from '@/lib/types'

export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getEffectiveEndMinutes(startTime: string, endTime: string): number {
  const start = parseTime(startTime)
  const end = parseTime(endTime)
  return end < start ? end + 1440 : end
}

export function findOverlapGroups(sessions: ScheduleSession[]): ScheduleSession[][] {
  const sorted = [...sessions].sort(
    (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
  )
  const groups: ScheduleSession[][] = []
  let currentGroup: ScheduleSession[] = []
  let groupEnd = 0
  for (const session of sorted) {
    const start = parseTime(session.startTime)
    const end = getEffectiveEndMinutes(session.startTime, session.endTime)
    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(session)
      groupEnd = Math.max(groupEnd, end)
    } else {
      groups.push(currentGroup)
      currentGroup = [session]
      groupEnd = end
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)
  return groups
}
