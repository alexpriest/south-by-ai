import type { Metadata } from 'next'
import Link from 'next/link'
import { getSessions } from '@/lib/sessions'
import { getTrackColor } from '@/lib/track-colors'
import { SessionList } from '@/components/browse/session-list'

export const dynamic = 'force-dynamic'

interface TrackPageProps {
  params: Promise<{ track: string }>
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { track } = await params
  const trackName = decodeURIComponent(track)
  return {
    title: `${trackName} | South by AI`,
  }
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { track } = await params
  const trackName = decodeURIComponent(track)
  const sessions = await getSessions()
  const trackSessions = sessions.filter((s) => s.track === trackName)
  const color = getTrackColor(trackName)

  if (trackSessions.length === 0) {
    return (
      <main className="min-h-screen bg-background py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/browse"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            &larr; Browse
          </Link>
          <h1 className="font-heading text-3xl font-bold mt-4">
            Track not found
          </h1>
          <p className="text-muted mt-4">
            No sessions found for &ldquo;{trackName}&rdquo;.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-accent transition-colors">
            Browse
          </Link>
          <span>/</span>
          <span className="text-text">{trackName}</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold mb-8">
          <span style={{ color }}>{trackName}</span>
        </h1>

        <SessionList sessions={trackSessions} />
      </div>
    </main>
  )
}
