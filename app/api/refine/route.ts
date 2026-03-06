import { NextResponse } from 'next/server'
import { getSessions } from '@/lib/sessions'
import { refineSchedule } from '@/lib/claude'
import { getSchedule, saveSchedule } from '@/lib/kv'
import { checkRefineLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown'
    if (!(await checkRefineLimit(ip))) {
      return NextResponse.json(
        { error: 'You\'ve been refining a lot — take a breather and try again in a few.' },
        { status: 429 }
      )
    }

    const { scheduleId, message } = await request.json()

    if (!scheduleId || !message?.trim()) {
      return NextResponse.json(
        { error: 'We need a message to work with. Type what you\'d like to change and try again.' },
        { status: 400 }
      )
    }

    const trimmedMessage = message.trim().slice(0, 1000)

    const schedule = await getSchedule(scheduleId)
    if (!schedule) {
      return NextResponse.json(
        { error: 'That schedule doesn\'t exist — double-check the link or start fresh.' },
        { status: 404 }
      )
    }

    const sessions = await getSessions()
    const { days, reply } = await refineSchedule(schedule, trimmedMessage, sessions)

    schedule.days = days
    schedule.chatHistory.push(
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: reply }
    )

    if (schedule.chatHistory.length > 20) {
      schedule.chatHistory = schedule.chatHistory.slice(-20)
    }

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
