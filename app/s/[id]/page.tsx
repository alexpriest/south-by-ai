import { notFound } from 'next/navigation'
import { getSchedule } from '@/lib/kv'
import { ScheduleView } from './schedule-view'

export default async function SchedulePage({ params }: { params: { id: string } }) {
  const schedule = await getSchedule(params.id)

  if (!schedule) {
    notFound()
  }

  return <ScheduleView schedule={schedule} />
}
