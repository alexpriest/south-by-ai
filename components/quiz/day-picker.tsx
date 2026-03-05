'use client'

const DAYS = [
  { id: '2026-03-07', label: 'Sat Mar 7' },
  { id: '2026-03-08', label: 'Sun Mar 8' },
  { id: '2026-03-09', label: 'Mon Mar 9' },
  { id: '2026-03-10', label: 'Tue Mar 10' },
  { id: '2026-03-11', label: 'Wed Mar 11' },
  { id: '2026-03-12', label: 'Thu Mar 12' },
  { id: '2026-03-13', label: 'Fri Mar 13' },
  { id: '2026-03-14', label: 'Sat Mar 14' },
  { id: '2026-03-15', label: 'Sun Mar 15' },
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

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        Which days are you in town?
      </h2>
      <p className="text-muted mb-6">We&apos;ll only schedule days you pick.</p>
      <div className="flex flex-wrap gap-3">
        {DAYS.map((day) => {
          const isSelected = selected.includes(day.id)
          return (
            <button
              key={day.id}
              onClick={() => toggle(day.id)}
              aria-pressed={isSelected}
              className={`rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                  : 'bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {day.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
