const TRACK_COLORS: Record<string, string> = {
  'Tech & AI': '#3B82F6',
  'Design': '#8B5CF6',
  'Culture': '#EC4899',
  'Health': '#10B981',
  'Creator Economy': '#F59E0B',
  'Brand & Marketing': '#EF4444',
  'Cities & Climate': '#06B6D4',
  'Startups': '#FF6B35',
  'Startups & Investment': '#FF6B35',
  'Sports & Gaming': '#84CC16',
  'Music': '#A855F7',
  'Film & TV': '#F43F5E',
  'Workplace': '#6366F1',
  'Global': '#14B8A6',
  'Headliner': '#00D4AA',
}

const DEFAULT_COLOR = '#6B7280'

export function getTrackColor(track: string): string {
  return TRACK_COLORS[track] || DEFAULT_COLOR
}
