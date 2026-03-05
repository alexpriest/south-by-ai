'use client'

const INTERESTS = [
  'AI', 'Design', 'Film', 'Music', 'Gaming', 'Health',
  'Climate', 'Startups', 'Food', 'Sports', 'Creator Economy',
  'Web3', 'XR', 'Government', 'Space', 'Future of Work', 'Enterprise',
]

interface InterestChipsProps {
  selected: string[]
  onChange: (interests: string[]) => void
}

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest))
    } else {
      onChange([...selected, interest])
    }
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What gets you out of bed at SXSW?
      </h2>
      <p className="text-muted mb-6">Pick as many as you want.</p>
      <div className="flex flex-wrap gap-2.5">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest)
          return (
            <button
              key={interest}
              onClick={() => toggle(interest)}
              aria-pressed={isSelected}
              className={`rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                  : 'bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {interest}
            </button>
          )
        })}
      </div>
    </div>
  )
}
