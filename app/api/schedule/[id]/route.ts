import { NextResponse } from 'next/server'
import { getSchedule } from '@/lib/kv'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const schedule = await getSchedule(params.id)

  if (!schedule) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(schedule)
}
