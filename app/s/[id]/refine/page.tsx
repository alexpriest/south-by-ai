import { notFound } from 'next/navigation'
import { getSchedule } from '@/lib/kv'
import { RefineView } from './refine-view'

export default async function RefinePage({ params }: { params: { id: string } }) {
  const schedule = await getSchedule(params.id)

  if (!schedule) {
    notFound()
  }

  const { editToken, ...safeSchedule } = schedule
  return <RefineView schedule={safeSchedule} />
}
