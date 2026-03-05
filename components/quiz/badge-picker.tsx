'use client'

const BADGES = [
  { id: 'Platinum Badge', label: 'Platinum Badge', desc: 'Full access to Interactive, Music, and Film & TV' },
  { id: 'Innovation Badge', label: 'Innovation Badge', desc: 'Interactive tracks, tech, design, and startups' },
  { id: 'Music Badge', label: 'Music Badge', desc: 'Music showcases, industry sessions, and festivals' },
  { id: 'Film & TV Badge', label: 'Film & TV Badge', desc: 'Screenings, premieres, and film industry panels' },
]

interface BadgePickerProps {
  selected: string
  onChange: (badge: string) => void
}

export function BadgePicker({ selected, onChange }: BadgePickerProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What badge do you have?
      </h2>
      <p className="text-muted mb-6">This helps us only show sessions you can actually get into.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGES.map((badge) => {
          const isSelected = selected === badge.id
          return (
            <button
              key={badge.id}
              onClick={() => onChange(badge.id)}
              aria-pressed={isSelected}
              className={`rounded-xl px-4 py-3.5 text-left transition-all duration-200 min-h-[68px] ${
                isSelected
                  ? 'bg-primary/15 border-2 border-primary text-primary shadow-[0_0_16px_rgba(255,107,53,0.2)] scale-[1.02]'
                  : 'bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className={`block font-semibold text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>
                {badge.label}
              </span>
              <span className={`block text-xs mt-1 leading-relaxed ${isSelected ? 'text-primary/70' : 'text-muted'}`}>
                {badge.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
