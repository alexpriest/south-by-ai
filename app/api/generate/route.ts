import { NextResponse } from 'next/server'
import type { QuizState } from '@/lib/types'
import { getSessions } from '@/lib/sessions'
import { generateSchedule } from '@/lib/claude'
import { generateId, saveSchedule } from '@/lib/kv'
import { checkGenerateLimit, getClientIP } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
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

    // Validate array elements: must be strings, max 100 chars each
    body.interests = body.interests.filter((v: unknown) => typeof v === 'string').map((v: string) => v.slice(0, 100))
    body.vibes = body.vibes.filter((v: unknown) => typeof v === 'string').map((v: string) => v.slice(0, 100))
    // Validate days against ISO date format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
    body.days = body.days.filter((v: unknown) => {
      if (typeof v !== 'string' || !isoDateRegex.test(v)) return false
      const d = new Date(v + 'T00:00:00')
      return !isNaN(d.getTime()) && d.toISOString().startsWith(v)
    })

    if (!body.interests.length || !body.vibes.length || !body.days.length) {
      return NextResponse.json(
        { error: 'Invalid input values. Please check your selections and try again.' },
        { status: 400 }
      )
    }

    const sessions = await getSessions()
    let days
    let lastError: unknown

    // Attempt 1: 100 sessions, 30s timeout (leaves room for retry under 60s maxDuration)
    try {
      days = await generateSchedule(body, sessions, 100, 30000)
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`Generate attempt 1 failed (100 sessions): ${msg}`)

      // Attempt 2: 50 sessions, 20s timeout (total worst case ~51s, under 60s)
      await new Promise(r => setTimeout(r, 500))
      try {
        days = await generateSchedule(body, sessions, 50, 20000)
      } catch (err2) {
        lastError = err2
        const msg2 = err2 instanceof Error ? err2.message : String(err2)
        console.warn(`Generate attempt 2 failed (50 sessions): ${msg2}`)
      }
    }

    if (!days) {
      const msg = lastError instanceof Error ? lastError.message : String(lastError)
      console.error(`All generate attempts failed. Last error: ${msg}`, lastError)
      throw lastError
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
