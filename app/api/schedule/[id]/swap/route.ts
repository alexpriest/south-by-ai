import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { getSchedule, saveSchedule } from '@/lib/kv'
import { checkSwapLimit, getClientIP } from '@/lib/rate-limit'
import { parseTime, getEffectiveEndMinutes } from '@/lib/schedule-utils'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIP(request)
  if (!(await checkSwapLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many swaps — slow down and try again in a few minutes.' },
      { status: 429 }
    )
  }

  const { id } = await params
  const { dayDate, sessionId, editToken } = await request.json()

  if (typeof dayDate !== 'string' || typeof sessionId !== 'string' || typeof editToken !== 'string' || !dayDate || !sessionId) {
    return NextResponse.json({ error: 'Missing dayDate or sessionId' }, { status: 400 })
  }

  if (sessionId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 })
  }

  const schedule = await getSchedule(id)
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  if (!editToken || !safeCompare(editToken, schedule.editToken || '')) {
    return NextResponse.json({ error: 'You don\'t have permission to edit this schedule.' }, { status: 403 })
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
  const promotedStart = parseTime(promoted.startTime)
  const promotedEnd = getEffectiveEndMinutes(promoted.startTime, promoted.endTime)
  const overlapping = day.sessions.filter((s) => {
    return parseTime(s.startTime) < promotedEnd && promotedStart < getEffectiveEndMinutes(s.startTime, s.endTime)
  })

  // Demote any current top picks in the same time slot
  for (const s of overlapping) {
    if (s.id !== sessionId && s.priority === 1) {
      s.priority = 2
    }
  }

  // Promote the selected session
  promoted.priority = 1

  try {
    await saveSchedule(schedule)
  } catch (saveErr) {
    console.error('KV save failed after swap:', saveErr)
    return NextResponse.json(
      { error: 'Your changes couldn\'t be saved — try again.' },
      { status: 500 }
    )
  }

  const { editToken: _, ...publicSchedule } = schedule
  return NextResponse.json({ schedule: publicSchedule })
}
