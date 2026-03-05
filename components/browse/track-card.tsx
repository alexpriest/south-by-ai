import Link from 'next/link'
import { getTrackColor } from '@/lib/track-colors'

interface TrackCardProps {
  track: string
  count: number
}

export function TrackCard({ track, count }: TrackCardProps) {
  const color = getTrackColor(track)

  return (
    <Link
      href={`/browse/${encodeURIComponent(track)}`}
      className="group block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
        {track}
      </h3>
      <p className="text-sm text-muted mt-1">
        {count} session{count !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
