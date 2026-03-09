import { NextResponse } from 'next/server'
import { getSchedule } from '@/lib/kv'

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n')
}

function formatTime(date: string, time: string): string {
  // date: "2026-03-12", time: "10:00" → "20260312T100000"
  const [h, m] = time.split(':')
  return date.replace(/-/g, '') + 'T' + h.padStart(2, '0') + m.padStart(2, '0') + '00'
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const schedule = await getSchedule(id)

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  const events: string[] = []

  for (const day of schedule.days) {
    for (const session of day.sessions) {
      if (session.priority !== 1) continue

      const dtstart = formatTime(session.date || day.date, session.startTime)
      const dtend = formatTime(session.date || day.date, session.endTime)

      const description = [
        session.reason,
        '',
        session.url ? `View on SXSW: ${session.url}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${session.id}@southbyai`,
          `DTSTART;TZID=America/Chicago:${dtstart}`,
          `DTEND;TZID=America/Chicago:${dtend}`,
          `SUMMARY:${escapeIcsText(session.title)}`,
          `DESCRIPTION:${escapeIcsText(description)}`,
          session.venue ? `LOCATION:${escapeIcsText(session.venue)}` : '',
          session.url ? `URL:${escapeIcsText(session.url)}` : '',
          'END:VEVENT',
        ]
          .filter(Boolean)
          .join('\r\n')
      )
    }
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//South by AI//SXSW Schedule//EN',
    'CALNAME:SXSW 2026 Schedule',
    'X-WR-CALNAME:SXSW 2026 Schedule',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sxsw-schedule.ics"',
    },
  })
}
