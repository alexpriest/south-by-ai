import { NextResponse } from 'next/server'
import type { QuizState } from '@/lib/types'
import { getSessions } from '@/lib/sessions'
import { generateSchedule } from '@/lib/claude'
import { generateId, saveSchedule } from '@/lib/kv'

export async function POST(request: Request) {
  try {
    const body = await request.json() as QuizState

    if (!body.name?.trim() || !body.interests?.length || !body.days?.length) {
      return NextResponse.json(
        { error: 'Missing required quiz fields' },
        { status: 400 }
      )
    }

    const sessions = getSessions()
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
    console.error('Generate error:', e)
    return NextResponse.json(
      { error: 'Something broke building your schedule. Hit try again — AI has its off moments.' },
      { status: 500 }
    )
  }
}
