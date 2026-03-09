import { NextResponse } from 'next/server'
import type { QuizState } from '@/lib/types'
import { getSessions } from '@/lib/sessions'
import { generateSchedule } from '@/lib/claude'
import { generateId, saveSchedule } from '@/lib/kv'
import { checkGenerateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown'
    if (!(await checkGenerateLimit(ip))) {
      return NextResponse.json(
        { error: 'Easy there — you\'re generating schedules faster than Franklin can smoke a brisket. Try again in a few minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json() as QuizState

    if (typeof body.name !== 'string' || !Array.isArray(body.interests) || !Array.isArray(body.days) || !Array.isArray(body.vibes)) {
      return NextResponse.json(
        { error: 'Invalid request data.' },
        { status: 400 }
      )
    }
    if (typeof body.freeText !== 'undefined' && typeof body.freeText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request data.' },
        { status: 400 }
      )
    }

    if (!body.name?.trim() || !body.badge || !body.interests?.length || !body.vibes?.length || !body.days?.length) {
      return NextResponse.json(
        { error: 'Looks like some answers are missing. Head back and make sure you\'ve filled everything in.' },
        { status: 400 }
      )
    }

    body.name = body.name.trim().slice(0, 50)
    if (body.freeText) body.freeText = body.freeText.slice(0, 500)
    if (body.interests.length > 20) body.interests = body.interests.slice(0, 20)
    if (body.vibes.length > 10) body.vibes = body.vibes.slice(0, 10)
    if (body.days.length > 14) body.days = body.days.slice(0, 14)

    const sessions = await getSessions()
    let days
    try {
      days = await generateSchedule(body, sessions)
    } catch (first) {
      console.warn('First generate attempt failed, retrying:', first instanceof Error ? first.message : first)
      await new Promise(r => setTimeout(r, 1000))
      days = await generateSchedule(body, sessions)
    }
    const id = generateId()

    const { editToken } = await saveSchedule({
      id,
      name: body.name.trim(),
      preferences: body,
      days,
      chatHistory: [],
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ id, editToken })
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    console.error('Generate error:', err, e)
    return NextResponse.json(
      { error: 'Something broke building your schedule. Hit try again — AI has its off moments.' },
      { status: 500 }
    )
  }
}
