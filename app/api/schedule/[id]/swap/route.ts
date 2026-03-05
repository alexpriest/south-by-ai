import { NextRequest, NextResponse } from 'next/server'
import { getSchedule, saveSchedule } from '@/lib/kv'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { dayDate, sessionId } = await request.json()

  if (!dayDate || !sessionId) {
    return NextResponse.json({ error: 'Missing dayDate or sessionId' }, { status: 400 })
  }

  const schedule = await getSchedule(id)
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  const day = schedule.days.find((d) => d.date === dayDate)
  if (!day) {
    return NextResponse.json({ error: 'Day not found' }, { status: 404 })
  }

  const promoted = day.sessions.find((s) => s.id === sessionId)
  if (!promoted) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Find overlapping sessions: two sessions overlap if
  // sessionA.startTime < sessionB.endTime && sessionB.startTime < sessionA.endTime
  const overlapping = day.sessions.filter(
    (s) => s.startTime < promoted.endTime && promoted.startTime < s.endTime
  )

  // Demote any current top picks in the same time slot
  for (const s of overlapping) {
    if (s.id !== sessionId && s.priority === 1) {
      s.priority = 2
    }
  }

  // Promote the selected session
  promoted.priority = 1

  await saveSchedule(schedule)

  return NextResponse.json({ schedule })
}
