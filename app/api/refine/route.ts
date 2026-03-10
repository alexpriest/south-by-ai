import { NextResponse } from 'next/server'
import { getSessions } from '@/lib/sessions'
import { refineSchedule } from '@/lib/claude'
import { getSchedule, saveSchedule } from '@/lib/kv'
import { checkRefineLimit, getClientIP } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
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

    const totalSessions = days.reduce((sum, d) => sum + d.sessions.length, 0)
    if (totalSessions === 0) {
      return NextResponse.json(
        { error: 'The AI returned an empty schedule — your original is unchanged. Try rephrasing your request.' },
        { status: 500 }
      )
    }

    schedule.days = days
    schedule.chatHistory.push(
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: reply }
    )

    if (schedule.chatHistory.length > 20) {
      schedule.chatHistory = schedule.chatHistory.slice(-20)
    }

    try {
      await saveSchedule(schedule)
    } catch (saveErr) {
      console.error('KV save failed after refine:', saveErr)
      return NextResponse.json(
        { error: 'Your changes couldn\'t be saved — try again.' },
        { status: 500 }
      )
    }

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
