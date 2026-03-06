import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCachedSchedule } from '@/lib/kv'
import { ScheduleView } from './schedule-view'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const schedule = await getCachedSchedule(params.id)
  if (!schedule) return {}

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  const ogImage = `${baseUrl}/s/${params.id}/opengraph-image`

  return {
    title: `${schedule.name}'s SXSW Schedule - South by AI`,
    description: `Personalized SXSW 2026 schedule for ${schedule.name}, built by AI.`,
    openGraph: {
      title: `${schedule.name}'s SXSW Schedule`,
      description: `Personalized SXSW 2026 schedule built by AI.`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${schedule.name}'s SXSW Schedule`,
      images: [ogImage],
    },
  }
}

export default async function SchedulePage({ params }: { params: { id: string } }) {
  const schedule = await getCachedSchedule(params.id)

  if (!schedule) {
    notFound()
  }

  return <ScheduleView schedule={schedule} />
}
