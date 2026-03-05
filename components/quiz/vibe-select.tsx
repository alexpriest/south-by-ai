'use client'

const VIBES = [
  { id: 'learn', label: 'Learn Something', desc: 'Talks, panels, workshops. Feed your brain.' },
  { id: 'meet', label: 'Meet People', desc: 'Networking, meetups, happy hours. Work the room.' },
  { id: 'entertain', label: 'Be Entertained', desc: 'Screenings, showcases, performances. Lean back.' },
  { id: 'discover', label: 'Discover', desc: 'Off-the-radar sessions, weird stuff, happy accidents.' },
]

interface VibeSelectProps {
  selected: string
  onChange: (vibe: string) => void
}

export function VibeSelect({ selected, onChange }: VibeSelectProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What&apos;s your SXSW vibe?
      </h2>
      <p className="text-muted mb-6">Pick one.</p>
      <div className="flex flex-col gap-3">
        {VIBES.map((vibe) => {
          const isSelected = selected === vibe.id
          return (
            <button
              key={vibe.id}
              onClick={() => onChange(vibe.id)}
              aria-pressed={isSelected}
              className={`text-left rounded-xl p-5 transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/10 border border-primary shadow-[0_0_20px_rgba(255,107,53,0.1)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-semibold">{vibe.label}</div>
              <div className="text-sm text-muted mt-1">{vibe.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
