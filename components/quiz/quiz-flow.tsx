'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { NameInput } from './name-input'
import { BadgePicker } from './badge-picker'
import { InterestChips } from './interest-chips'
import { VibeSelect } from './vibe-select'
import { DayPicker } from './day-picker'
import { FreeText } from './free-text'
import type { QuizState } from '@/lib/types'

const LOADING_MESSAGES = [
  'Scanning 3,700+ sessions so you don\'t have to...',
  'Debating whether to schedule around taco breaks...',
  'Calculating optimal 6th Street proximity...',
  'Arguing with the AI about your music taste...',
  'Making sure your badge actually gets you in...',
  'Squeezing in one more panel before happy hour...',
  'Filtering out sessions that are just startup pitches in disguise...',
  'Plotting the fastest route from the Convention Center to Rainey St...',
  'Checking if that keynote is worth waking up for...',
  'Dodging e-scooters on Congress Ave...',
  'Reserving your spot in the Franklin BBQ line...',
  'Making sure your schedule survives a Dirty Sixth detour...',
]

const STEPS = ['name', 'badge', 'interests', 'vibe', 'days', 'freeText'] as const
type Step = typeof STEPS[number]

export function QuizFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('name')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [loadingMsgKey, setLoadingMsgKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [quiz, setQuiz] = useState<QuizState>({
    name: '',
    badge: '',
    interests: [],
    vibes: [],
    days: [],
    freeText: '',
  })

  const stepIndex = STEPS.indexOf(step)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const canAdvance = () => {
    switch (step) {
      case 'name': return quiz.name.trim().length > 0
      case 'badge': return quiz.badge.length > 0
      case 'interests': return quiz.interests.length > 0
      case 'vibe': return quiz.vibes.length > 0
      case 'days': return quiz.days.length > 0
      case 'freeText': return true
    }
  }

  const goToStep = useCallback((newStep: Step, dir: 'forward' | 'back') => {
    setDirection(dir)
    setAnimKey((k) => k + 1)
    setStep(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const next = () => {
    if (isLast) {
      submit()
    } else {
      goToStep(STEPS[stepIndex + 1], 'forward')
    }
  }

  const back = () => {
    if (!isFirst) {
      goToStep(STEPS[stepIndex - 1], 'back')
    }
  }

  const submit = async () => {
    setLoading(true)
    setError(null)

    const interval = setInterval(() => {
      const msg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
      setLoadingMessage(msg)
      setLoadingMsgKey((k) => k + 1)
    }, 3000)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something broke building your schedule. Hit try again — AI has its off moments.')
      }

      const { id, editSecret } = await res.json()
      if (editSecret) {
        localStorage.setItem(`editSecret:${id}`, editSecret)
      }
      router.push(`/s/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That didn\'t work. Give it another shot.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  // Handle Enter key to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canAdvance() && !loading) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, quiz, loading])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 max-w-md mx-auto" role="status" aria-live="polite">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-[-8px] rounded-full border border-primary/10 pulse-ring" />
        </div>
        <p key={loadingMsgKey} className="text-muted text-center text-sm loading-message-enter">
          {loadingMessage}
        </p>
      </div>
    )
  }

  const animClass = direction === 'forward' ? 'quiz-step-enter' : 'quiz-step-enter-back'

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">Step {stepIndex + 1} of {STEPS.length}</span>
        </div>
        <div className="h-1 bg-s1 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Quiz progress">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content with slide animation */}
      <div key={animKey} className={`mb-10 ${animClass}`}>
        {step === 'name' && (
          <NameInput value={quiz.name} onChange={(name) => setQuiz({ ...quiz, name })} />
        )}
        {step === 'badge' && (
          <BadgePicker selected={quiz.badge} onChange={(badge) => setQuiz({ ...quiz, badge })} />
        )}
        {step === 'interests' && (
          <InterestChips selected={quiz.interests} onChange={(interests) => setQuiz({ ...quiz, interests })} />
        )}
        {step === 'vibe' && (
          <VibeSelect selected={quiz.vibes} onChange={(vibes) => setQuiz({ ...quiz, vibes })} />
        )}
        {step === 'days' && (
          <DayPicker selected={quiz.days} onChange={(days) => setQuiz({ ...quiz, days })} />
        )}
        {step === 'freeText' && (
          <FreeText value={quiz.freeText} onChange={(freeText) => setQuiz({ ...quiz, freeText })} />
        )}
      </div>

      {error && (
        <p role="alert" className="text-error text-sm mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {!isFirst && (
          <button
            onClick={back}
            className="bg-s1 text-text rounded-full px-6 py-2.5 hover:bg-sh transition-all duration-200"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={!canAdvance()}
          className="bg-primary text-white rounded-full px-8 py-3 font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLast ? 'Generate My Schedule' : 'Next'}
        </button>
        {canAdvance() && (
          <span className="text-xs text-muted hidden sm:inline-flex items-center gap-1.5 ml-1">
            press <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-s2 border border-b1 text-[10px] font-medium text-muted">Enter ↵</kbd>
          </span>
        )}
      </div>
    </div>
  )
}
