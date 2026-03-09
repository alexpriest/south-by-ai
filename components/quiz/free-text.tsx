'use client'

interface FreeTextProps {
  value: string
  onChange: (value: string) => void
}

export function FreeText({ value, onChange }: FreeTextProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        Anything else we should know?
      </h2>
      <p className="text-muted mb-6">
        Bands you want to see, topics you&apos;re obsessed with, things to skip.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g., "Every AI panel, skip anything crypto" or "Must see Japanese Breakfast on Thursday"'
        rows={4}
        autoFocus
        aria-label="Additional preferences"
        className="w-full bg-s1 border border-b1 rounded-xl px-4 py-3 text-text placeholder:text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/25 focus:outline-none resize-none transition-colors duration-200"
      />
    </div>
  )
}
