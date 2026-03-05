import { NextResponse } from 'next/server'
import type { QuizState } from '@/lib/types'
import { getSessions } from '@/lib/sessions'
import { generateSchedule } from '@/lib/claude'
import { generateId, saveSchedule } from '@/lib/kv'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`gen:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many schedules generated. Please wait a bit before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json() as QuizState

    if (!body.name?.trim() || !body.badge || !body.interests?.length || !body.vibes?.length || !body.days?.length) {
      return NextResponse.json(
        { error: 'Missing required quiz fields' },
        { status: 400 }
      )
    }

    const sessions = await getSessions()
    const days = await generateSchedule(body, sessions)
    const id = generateId()

    await saveSchedule({
      id,
      name: body.name.trim(),
      preferences: body,
      days,
      chatHistory: [],
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ id })
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    console.error('Generate error:', err, e)
    return NextResponse.json(
      { error: 'Something broke building your schedule. Hit try again — AI has its off moments.' },
      { status: 500 }
    )
  }
}
