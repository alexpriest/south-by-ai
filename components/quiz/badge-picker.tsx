'use client'

import { useEffect } from 'react'

const BADGES = [
  { id: 'Platinum Badge', label: 'Platinum Badge', desc: 'Full access to Interactive, Music, and Film & TV' },
  { id: 'Innovation Badge', label: 'Innovation Badge', desc: 'Interactive tracks, tech, design, and startups' },
  { id: 'Music Badge', label: 'Music Badge', desc: 'Music showcases, industry sessions, and festivals' },
  { id: 'Film & TV Badge', label: 'Film & TV Badge', desc: 'Screenings, premieres, and film industry panels' },
]

const KEYS = ['A', 'B', 'C', 'D']

interface BadgePickerProps {
  selected: string
  onChange: (badge: string) => void
}

export function BadgePicker({ selected, onChange }: BadgePickerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toUpperCase()
      const idx = KEYS.indexOf(key)
      if (idx !== -1 && idx < BADGES.length) {
        e.preventDefault()
        onChange(BADGES[idx].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onChange])

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What badge do you have?
      </h2>
      <p className="text-muted mb-6">This helps us only show sessions you can actually get into.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGES.map((badge, i) => {
          const isSelected = selected === badge.id
          return (
            <button
              key={badge.id}
              onClick={() => onChange(badge.id)}
              aria-pressed={isSelected}
              className={`rounded-xl px-4 py-3.5 text-left transition-all duration-200 min-h-[68px] ${
                isSelected
                  ? 'bg-primary/15 border-2 border-primary text-primary shadow-[0_0_16px_rgba(255,107,53,0.2)] scale-[1.02]'
                  : 'bg-s1 border border-b1 text-text hover:bg-s2 hover:border-bh'
              }`}
            >
              <div className="flex items-start gap-3">
                <kbd className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold shrink-0 mt-0.5 transition-colors duration-200 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-s2 text-muted border border-b1'
                }`}>
                  {KEYS[i]}
                </kbd>
                <div className="min-w-0">
                  <span className={`block font-semibold text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>
                    {badge.label}
                  </span>
                  <span className={`block text-xs mt-1 leading-relaxed ${isSelected ? 'text-primary/70' : 'text-muted'}`}>
                    {badge.desc}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
