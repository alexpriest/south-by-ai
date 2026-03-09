import { notFound } from 'next/navigation'
import { getSchedule } from '@/lib/kv'
import { RefineView } from './refine-view'

export default async function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const schedule = await getSchedule(id)

  if (!schedule) {
    notFound()
  }

  const { editToken, ...safeSchedule } = schedule
  return <RefineView schedule={safeSchedule} />
}
