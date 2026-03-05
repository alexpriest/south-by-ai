'use client'

interface NameInputProps {
  value: string
  onChange: (value: string) => void
}

export function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div>
      <label htmlFor="name-input" className="font-heading text-2xl font-bold mb-2 block">
        What&apos;s your name?
      </label>
      <input
        id="name-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="First name works"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/25 focus:outline-none transition-colors duration-200"
        autoFocus
      />
    </div>
  )
}
