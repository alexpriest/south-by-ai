import { NextResponse } from 'next/server'
import { getSchedule } from '@/lib/kv'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const schedule = await getSchedule(id)

  if (!schedule) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { editSecret: _secret, ...safeSchedule } = schedule
  return NextResponse.json(safeSchedule, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
