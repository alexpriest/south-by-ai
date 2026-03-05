import { NextResponse } from 'next/server'
import { getSessions } from '@/lib/sessions'
import { refineSchedule } from '@/lib/claude'
import { getSchedule, saveSchedule } from '@/lib/kv'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`refine:${ip}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many refinements. Please wait a bit.' },
        { status: 429 }
      )
    }

    const { scheduleId, message } = await request.json()

    if (!scheduleId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing scheduleId or message' },
        { status: 400 }
      )
    }

    const schedule = await getSchedule(scheduleId)
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    const sessions = await getSessions()
    const { days, reply } = await refineSchedule(schedule, message.trim(), sessions)

    schedule.days = days
    schedule.chatHistory.push(
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: reply }
    )

    await saveSchedule(schedule)

    return NextResponse.json({ schedule, reply })
  } catch (e) {
    console.error('Refine error:', e)
    return NextResponse.json(
      { error: 'That didn\'t work. Give it another shot.' },
      { status: 500 }
    )
  }
}
