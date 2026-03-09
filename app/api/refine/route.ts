import { NextResponse } from 'next/server'
import { getSessions } from '@/lib/sessions'
import { refineSchedule } from '@/lib/claude'
import { getSchedule, saveSchedule } from '@/lib/kv'
import { checkRefineLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    if (!(await checkRefineLimit(ip))) {
      return NextResponse.json(
        { error: 'You\'ve been refining a lot — take a breather and try again in a few.' },
        { status: 429 }
      )
    }

    const { scheduleId, message, editToken } = await request.json()

    if (typeof scheduleId !== 'string' || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request data.' },
        { status: 400 }
      )
    }

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

    if (!editToken || editToken !== schedule.editToken) {
      return NextResponse.json(
        { error: 'You don\'t have permission to edit this schedule.' },
        { status: 403 }
      )
    }

    const sessions = await getSessions()
    let days, reply
    try {
      ({ days, reply } = await refineSchedule(schedule, trimmedMessage, sessions))
    } catch (first) {
      console.warn('First refine attempt failed, retrying:', first instanceof Error ? first.message : first)
      await new Promise((r) => setTimeout(r, 1000))
      ;({ days, reply } = await refineSchedule(schedule, trimmedMessage, sessions))
    }

    schedule.days = days
    schedule.chatHistory.push(
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: reply }
    )

    if (schedule.chatHistory.length > 20) {
      schedule.chatHistory = schedule.chatHistory.slice(-20)
    }

    await saveSchedule(schedule)

    const { editToken: _, ...publicSchedule } = schedule
    return NextResponse.json({ schedule: publicSchedule, reply })
  } catch (e) {
    console.error('Refine error:', e)
    return NextResponse.json(
      { error: 'That didn\'t work. Give it another shot.' },
      { status: 500 }
    )
  }
}
