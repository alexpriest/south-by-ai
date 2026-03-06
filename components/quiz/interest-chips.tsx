'use client'

import { useEffect } from 'react'

const INTERESTS = [
  { id: 'Tech & AI', label: 'Tech & AI', desc: 'Artificial intelligence, emerging tech, software' },
  { id: 'Design', label: 'Design', desc: 'Product design, UX, creative tools' },
  { id: 'Culture', label: 'Culture', desc: 'Art, social issues, storytelling' },
  { id: 'Health', label: 'Health', desc: 'Wellness, medtech, mental health' },
  { id: 'Creator Economy', label: 'Creator Economy', desc: 'Influencers, platforms, monetization' },
  { id: 'Brand & Marketing', label: 'Brand & Marketing', desc: 'Advertising, brand strategy, growth' },
  { id: 'Cities & Climate', label: 'Cities & Climate', desc: 'Urban planning, sustainability, climate tech' },
  { id: 'Startups', label: 'Startups', desc: 'Founders, venture capital, pitch competitions' },
  { id: 'Sports & Gaming', label: 'Sports & Gaming', desc: 'Esports, sports tech, gaming culture' },
  { id: 'Music', label: 'Music', desc: 'Live music, music industry, artist showcases' },
  { id: 'Film & TV', label: 'Film & TV', desc: 'Screenings, TV premieres, documentary' },
  { id: 'Workplace', label: 'Workplace', desc: 'Future of work, HR tech, remote culture' },
  { id: 'Global', label: 'Global', desc: 'International perspectives, geopolitics' },
  { id: 'Headliner', label: 'Headliner', desc: 'Keynotes and featured speakers' },
]

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']

interface InterestChipsProps {
  selected: string[]
  onChange: (interests: string[]) => void
}

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id))
    } else {
      onChange([...selected, id])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toUpperCase()
      const idx = KEYS.indexOf(key)
      if (idx !== -1 && idx < INTERESTS.length) {
        e.preventDefault()
        toggle(INTERESTS[idx].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, onChange])

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What gets you out of bed at SXSW?
      </h2>
      <p className="text-muted mb-6">Pick as many as you want.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {INTERESTS.map((interest, i) => {
          const isSelected = selected.includes(interest.id)
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              aria-pressed={isSelected}
              className={`rounded-xl px-4 py-3.5 text-left transition-all duration-200 min-h-[68px] ${
                isSelected
                  ? 'bg-primary/15 border-2 border-primary text-primary shadow-[0_0_16px_rgba(255,107,53,0.2)] scale-[1.02]'
                  : 'bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20'
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
                  <span className={`block font-semibold text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>
                    {interest.label}
                  </span>
                  <span className={`block text-xs mt-1 leading-relaxed ${isSelected ? 'text-primary/70' : 'text-muted'}`}>
                    {interest.desc}
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
