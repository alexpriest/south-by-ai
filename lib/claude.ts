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
    priority: number
  }[]
}

export async function generateSchedule(
  preferences: QuizState,
  sessions: Session[]
): Promise<DaySchedule[]> {
  const filteredSessions = sessions.filter((s) => {
    if (!preferences.days.includes(s.date)) return false
    if (preferences.badge && !s.badgeTypes.includes(preferences.badge)) return false
    return true
  })

  // Further filter by selected tracks to reduce token count
  const trackFiltered = filteredSessions.filter((s) =>
    preferences.interests.some((interest) =>
      s.track.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(s.track.toLowerCase())
    )
  )

  // Use track-filtered if it has enough sessions, otherwise fall back to all badge-filtered
  const sessionsForClaude = trackFiltered.length >= 20 ? trackFiltered : filteredSessions

  const sessionsForPrompt = sessionsForClaude.map((s) => ({
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
    system: `You are a SXSW 2026 schedule builder. Given user preferences and available sessions, select 6-10 sessions per day that best match the user's interests and vibe. For each time slot, pick a clear top choice and include 1-2 alternatives. Avoid scheduling more than 3 sessions in the same time slot. Respond with valid JSON only — no markdown, no explanation, no code fences.

Each session needs a priority:
- 1 = Top pick for this time slot (at most one per time slot)
- 2 = Good alternative
- 3 = Worth considering

When choosing between sessions of similar quality in the same time slot, prefer sessions at the same venue or nearby venues to minimize walking. Austin Convention Center, Fairmont Austin, Hilton Austin, and JW Marriott are all within a 5-minute walk of each other. Palmer Events Center and Long Center are nearby each other but 15 minutes from the Convention Center. Venues on 6th Street (Mohawk, Stubbs, Empire Control Room, Antone's, Esther's Follies, Paramount Theatre) are clustered together. Avoid scheduling back-to-back sessions at distant venues when possible.

Response format:
[
  {
    "date": "YYYY-MM-DD",
    "label": "Day Label (e.g. Saturday Mar 14)",
    "sessions": [
      { "id": "session_id", "reason": "Brief reason why this session matches the user", "priority": 1 }
    ]
  }
]`,
    messages: [
      {
        role: 'user',
        content: `Build a SXSW schedule for ${preferences.name}.

Interests: ${preferences.interests.join(', ')}
Vibes: ${preferences.vibes.join(', ')}
Days attending: ${preferences.days.join(', ')}
${preferences.freeText ? `Additional notes: ${preferences.freeText}` : ''}

Available sessions:
${JSON.stringify(sessionsForPrompt)}`,
      },
    ],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
  // Strip markdown code fences if Claude wraps the response
  const text = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
  let parsed: ClaudeScheduleDay[]
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse schedule from AI response')
  }

  const sessionMap = new Map(sessionsForClaude.map((s) => [s.id, s]))

  return parsed.map((day) => {
    const seenIds = new Set<string>()
    const seenTitles = new Set<string>()
    return {
      date: day.date,
      label: day.label,
      sessions: day.sessions
        .map((pick) => {
          if (seenIds.has(pick.id)) return null
          seenIds.add(pick.id)
          const session = sessionMap.get(pick.id)
          if (!session) return null
          // Skip duplicate titles (e.g. same film screening in multiple rooms)
          if (seenTitles.has(session.title)) return null
          seenTitles.add(session.title)
          return { ...session, reason: pick.reason, priority: pick.priority || 2 } as ScheduleSession
        })
        .filter((s): s is ScheduleSession => s !== null),
    }
  })
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
    .filter((s) => {
      if (!schedule.preferences.days.includes(s.date)) return false
      if (schedule.preferences.badge && !s.badgeTypes.includes(schedule.preferences.badge)) return false
      return true
    })
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
    max_tokens: 16384,
    system: `You are a SXSW 2026 schedule assistant helping ${schedule.name} refine their schedule. The user wants changes. Update the schedule based on their request.

IMPORTANT: If the user asks for ALL sessions of a certain type (e.g. "all films", "every music session"), include ALL matching sessions from the available sessions list — do not limit to 6-10. For normal refinement requests, keep 6-10 sessions per day.

Each session needs a priority:
- 1 = Top pick for this time slot (at most one per time slot)
- 2 = Good alternative
- 3 = Worth considering

When choosing between sessions of similar quality in the same time slot, prefer sessions at the same venue or nearby venues to minimize walking. Austin Convention Center, Fairmont Austin, Hilton Austin, and JW Marriott are all within a 5-minute walk of each other. Palmer Events Center and Long Center are nearby each other but 15 minutes from the Convention Center. Venues on 6th Street (Mohawk, Stubbs, Empire Control Room, Antone's, Esther's Follies, Paramount Theatre) are clustered together. Avoid scheduling back-to-back sessions at distant venues when possible.

Respond with valid JSON only — no markdown, no code fences. Use this format:
{
  "reply": "A short, conversational message about what you changed (1-2 sentences, casual tone)",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "label": "Day Label",
      "sessions": [
        { "id": "session_id", "reason": "Why this session is included", "priority": 1 }
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

  const rawRefineText = message.content[0].type === 'text' ? message.content[0].text : ''
  const refineText = rawRefineText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
  let parsed: { reply: string; days: ClaudeScheduleDay[] }
  try {
    parsed = JSON.parse(refineText)
  } catch {
    throw new Error('Failed to parse refinement from AI response')
  }

  const sessionMap = new Map(sessions.map((s) => [s.id, s]))

  const days: DaySchedule[] = parsed.days.map((day) => {
    const seenIds = new Set<string>()
    const seenTitles = new Set<string>()
    return {
      date: day.date,
      label: day.label,
      sessions: day.sessions
        .map((pick) => {
          if (seenIds.has(pick.id)) return null
          seenIds.add(pick.id)
          const session = sessionMap.get(pick.id)
          if (!session) return null
          // Skip duplicate titles (e.g. same film screening in multiple rooms)
          if (seenTitles.has(session.title)) return null
          seenTitles.add(session.title)
          return { ...session, reason: pick.reason, priority: pick.priority || 2 } as ScheduleSession
        })
        .filter((s): s is ScheduleSession => s !== null),
    }
  })

  return { days, reply: parsed.reply }
}
