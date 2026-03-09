import { NextRequest, NextResponse } from 'next/server'
import { getSchedule, saveSchedule, validateEditSecret } from '@/lib/kv'
import { checkSwapLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
  if (!(await checkSwapLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many swap requests. Try again in a few minutes.' },
      { status: 429 }
    )
  }

  const { id } = await params
  const { dayDate, sessionId, editSecret } = await request.json()

  if (!dayDate || !sessionId) {
    return NextResponse.json({ error: 'Missing dayDate or sessionId' }, { status: 400 })
  }

  const schedule = await getSchedule(id)
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  if (!editSecret || !validateEditSecret(schedule, editSecret)) {
    return NextResponse.json(
      { error: 'You don\'t have permission to edit this schedule.' },
      { status: 403 }
    )
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

  const { editSecret: _secret, ...safeSchedule } = schedule
  return NextResponse.json({ schedule: safeSchedule })
}
