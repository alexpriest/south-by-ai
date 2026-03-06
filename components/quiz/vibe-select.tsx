'use client'

import { useEffect } from 'react'

const VIBES = [
  { id: 'learn', label: 'Learn Something', desc: 'Talks, panels, workshops. Feed your brain.' },
  { id: 'meet', label: 'Meet People', desc: 'Networking, meetups, happy hours. Work the room.' },
  { id: 'entertain', label: 'Be Entertained', desc: 'Screenings, showcases, performances. Lean back.' },
  { id: 'discover', label: 'Discover', desc: 'Off-the-radar sessions, weird stuff, happy accidents.' },
]

const KEYS = ['A', 'B', 'C', 'D']

interface VibeSelectProps {
  selected: string[]
  onChange: (vibes: string[]) => void
}

export function VibeSelect({ selected, onChange }: VibeSelectProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id))
    } else {
      onChange([...selected, id])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toUpperCase()
      const idx = KEYS.indexOf(key)
      if (idx !== -1 && idx < VIBES.length) {
        e.preventDefault()
        toggle(VIBES[idx].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, onChange])

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What&apos;s your SXSW vibe?
      </h2>
      <p className="text-muted mb-6">Pick as many as you want.</p>
      <div className="flex flex-col gap-3">
        {VIBES.map((vibe, i) => {
          const isSelected = selected.includes(vibe.id)
          return (
            <button
              key={vibe.id}
              onClick={() => toggle(vibe.id)}
              aria-pressed={isSelected}
              className={`text-left rounded-xl p-5 transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/15 border-2 border-primary shadow-[0_0_20px_rgba(255,107,53,0.15)] scale-[1.01]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <kbd className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold shrink-0 mt-0.5 transition-colors duration-200 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-muted border border-white/10'
                }`}>
                  {KEYS[i]}
                </kbd>
                <div className="min-w-0">
                  <div className={`font-semibold ${isSelected ? 'text-primary' : ''}`}>{vibe.label}</div>
                  <div className={`text-sm mt-1 ${isSelected ? 'text-primary/70' : 'text-muted'}`}>{vibe.desc}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
