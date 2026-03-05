import type { Metadata } from 'next'
import Link from 'next/link'
import { getSessions } from '@/lib/sessions'
import { TrackCard } from '@/components/browse/track-card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse Categories | South by AI',
}

export default async function BrowsePage() {
  const sessions = await getSessions()

  const trackCounts = new Map<string, number>()
  for (const session of sessions) {
    trackCounts.set(session.track, (trackCounts.get(session.track) || 0) + 1)
  }

  const tracks = Array.from(trackCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([track, count]) => ({ track, count }))

  return (
    <main className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          &larr; Home
        </Link>

        <h1 className="font-heading text-3xl font-bold mt-4 mb-8">
          Browse by Category
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tracks.map(({ track, count }) => (
            <TrackCard key={track} track={track} count={count} />
          ))}
        </div>
      </div>
    </main>
  )
}
