import Anthropic from '@anthropic-ai/sdk'
import type { QuizState, Session, DaySchedule, StoredSchedule, ScheduleSession } from './types'

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey })
}

interface ClaudeScheduleDay {
  date: string
  label: string
  sessions: {
    id: string
    reason: string
  }[]
}

export async function generateSchedule(
  preferences: QuizState,
  sessions: Session[]
): Promise<DaySchedule[]> {
  const filteredSessions = sessions.filter((s) =>
    preferences.days.includes(s.date)
  )

  const sessionsForPrompt = filteredSessions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    track: s.track,
    type: s.type,
    format: s.format,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    venue: s.venue,
    tags: s.tags,
  }))

  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are a SXSW 2026 schedule builder. Given user preferences and available sessions, select 4-6 sessions per day that best match the user's interests and vibe. Avoid time conflicts. Respond with valid JSON only — no markdown, no explanation, no code fences.

Response format:
[
  {
    "date": "YYYY-MM-DD",
    "label": "Day Label (e.g. Saturday Mar 7)",
    "sessions": [
      { "id": "session_id", "reason": "Brief reason why this session matches the user" }
    ]
  }
]`,
    messages: [
      {
        role: 'user',
        content: `Build a SXSW schedule for ${preferences.name}.

Interests: ${preferences.interests.join(', ')}
Vibe: ${preferences.vibe}
Days attending: ${preferences.days.join(', ')}
${preferences.freeText ? `Additional notes: ${preferences.freeText}` : ''}

Available sessions:
${JSON.stringify(sessionsForPrompt)}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  let parsed: ClaudeScheduleDay[]
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse schedule from AI response')
  }

  const sessionMap = new Map(filteredSessions.map((s) => [s.id, s]))

  return parsed.map((day) => ({
    date: day.date,
    label: day.label,
    sessions: day.sessions
      .map((pick) => {
        const session = sessionMap.get(pick.id)
        if (!session) return null
        return { ...session, reason: pick.reason } as ScheduleSession
      })
      .filter((s): s is ScheduleSession => s !== null),
  }))
}

export async function refineSchedule(
  schedule: StoredSchedule,
  userMessage: string,
  sessions: Session[]
): Promise<{ days: DaySchedule[]; reply: string }> {
  const currentScheduleSummary = schedule.days.map((day) => ({
    date: day.date,
    label: day.label,
    sessions: day.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      track: s.track,
      reason: s.reason,
    })),
  }))

  const availableSessions = sessions
    .filter((s) => schedule.preferences.days.includes(s.date))
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      track: s.track,
      format: s.format,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      tags: s.tags,
    }))

  const chatHistory = schedule.chatHistory.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are a SXSW 2026 schedule assistant helping ${schedule.name} refine their schedule. The user wants changes. Update the schedule based on their request.

Respond with valid JSON only — no markdown, no code fences. Use this format:
{
  "reply": "A short, conversational message about what you changed (1-2 sentences, casual tone)",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "label": "Day Label",
      "sessions": [
        { "id": "session_id", "reason": "Why this session is included" }
      ]
    }
  ]
}

Current schedule:
${JSON.stringify(currentScheduleSummary)}

Available sessions (you can swap in any of these):
${JSON.stringify(availableSessions)}`,
    messages: [
      ...chatHistory,
      { role: 'user' as const, content: userMessage },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  let parsed: { reply: string; days: ClaudeScheduleDay[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse refinement from AI response')
  }

  const sessionMap = new Map(sessions.map((s) => [s.id, s]))

  const days: DaySchedule[] = parsed.days.map((day) => ({
    date: day.date,
    label: day.label,
    sessions: day.sessions
      .map((pick) => {
        const session = sessionMap.get(pick.id)
        if (!session) return null
        return { ...session, reason: pick.reason } as ScheduleSession
      })
      .filter((s): s is ScheduleSession => s !== null),
  }))

  return { days, reply: parsed.reply }
}
