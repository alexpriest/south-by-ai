'use client'

import { useState, useEffect } from 'react'

interface ShareButtonProps {
  scheduleId: string
}

export function ShareButton({ scheduleId }: ShareButtonProps) {
  const [toastState, setToastState] = useState<'hidden' | 'entering' | 'exiting'>('hidden')

  const share = async () => {
    const url = `${window.location.origin}/s/${scheduleId}`
    await navigator.clipboard.writeText(url)
    setToastState('entering')
  }

  useEffect(() => {
    if (toastState === 'entering') {
      const timer = setTimeout(() => setToastState('exiting'), 2000)
      return () => clearTimeout(timer)
    }
    if (toastState === 'exiting') {
      const timer = setTimeout(() => setToastState('hidden'), 300)
      return () => clearTimeout(timer)
    }
  }, [toastState])

  return (
    <>
      <button
        onClick={share}
        aria-label="Copy schedule link to clipboard"
        className="bg-white/10 text-white rounded-full px-6 py-2.5 hover:bg-white/20 active:bg-white/25 transition-all duration-200 text-sm"
      >
        Share Schedule
      </button>

      {toastState !== 'hidden' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`bg-accent text-background font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg ${
              toastState === 'entering' ? 'toast-enter' : 'toast-exit'
            }`}
          >
            Link copied
          </div>
        </div>
      )}
    </>
  )
}
