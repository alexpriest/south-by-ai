'use client'

import { useEffect } from 'react'

const DAYS = [
  { id: '2026-03-12', label: 'Thu Mar 12' },
  { id: '2026-03-13', label: 'Fri Mar 13' },
  { id: '2026-03-14', label: 'Sat Mar 14' },
  { id: '2026-03-15', label: 'Sun Mar 15' },
  { id: '2026-03-16', label: 'Mon Mar 16' },
  { id: '2026-03-17', label: 'Tue Mar 17' },
  { id: '2026-03-18', label: 'Wed Mar 18' },
]

interface DayPickerProps {
  selected: string[]
  onChange: (days: string[]) => void
}

export function DayPicker({ selected, onChange }: DayPickerProps) {
  const toggle = (day: string) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day))
    } else {
      onChange([...selected, day])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= DAYS.length) {
        e.preventDefault()
        toggle(DAYS[num - 1].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, onChange])

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        Which days are you in town?
      </h2>
      <p className="text-muted mb-6">We&apos;ll only schedule days you pick.</p>
      <div className="flex flex-wrap gap-3">
        {DAYS.map((day, i) => {
          const isSelected = selected.includes(day.id)
          return (
            <button
              key={day.id}
              onClick={() => toggle(day.id)}
              aria-pressed={isSelected}
              className={`rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                  : 'bg-s1 border border-b1 text-text hover:bg-s2 hover:border-bh'
              }`}
            >
              <kbd className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold mr-2 transition-colors duration-200 ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-s2 text-muted border border-b1'
              }`}>
                {i + 1}
              </kbd>
              {day.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
