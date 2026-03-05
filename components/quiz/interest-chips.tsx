'use client'

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

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        What gets you out of bed at SXSW?
      </h2>
      <p className="text-muted mb-6">Pick as many as you want.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id)
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              aria-pressed={isSelected}
              className={`rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                  : 'bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="block font-semibold text-sm">{interest.label}</span>
              <span className="block text-xs text-muted mt-0.5">{interest.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
