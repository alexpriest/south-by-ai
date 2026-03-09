'use client'

import { useState, useEffect, useRef } from 'react'

interface ShareButtonProps {
  scheduleId: string
  scheduleName: string
}

export function ShareButton({ scheduleId, scheduleName }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${scheduleId}`
    : `/s/${scheduleId}`

  const shareText = `Just got my SXSW 2026 schedule sorted by AI — here's what I'm hitting`

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus()
      return
    }
    // Focus the first button when dialog opens
    requestAnimationFrame(() => firstButtonRef.current?.focus())
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for HTTP or unfocused pages
      setCopied(false)
    }
  }

  const shareToX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const shareToThreads = () => {
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      '_blank'
    )
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="bg-s2 text-text rounded-full px-6 py-2.5 hover:bg-sh active:bg-sa transition-all duration-200 text-sm"
      >
        Share
      </button>

      {open && (
        <>
        <div
          className="fixed inset-0 bg-black/40 z-[1099] sm:hidden"
          onClick={() => setOpen(false)}
        />
        <div
          ref={ref}
          role="dialog"
          aria-label="Share schedule"
          className="fixed bottom-4 left-4 right-4 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 bg-background border border-b1 rounded-xl shadow-2xl p-4 z-[1100] popover-enter"
        >
          <p className="text-sm font-medium text-text mb-1">
            Share {scheduleName}&apos;s SXSW Schedule
          </p>
          <p className="text-xs text-muted mb-4">
            Send this to your crew so you can actually find each other.
          </p>

          {/* Copy link */}
          <button
            ref={firstButtonRef}
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-s1 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-s2 flex items-center justify-center shrink-0">
              {copied ? (
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-muted group-hover:text-text transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text">{copied ? 'Copied!' : 'Copy link'}</p>
              <p className="text-caption text-muted truncate max-w-[180px]">{url}</p>
            </div>
          </button>

          {/* Share to X */}
          <button
            onClick={shareToX}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-s1 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-s2 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-muted group-hover:text-text transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text">Share on X</p>
              <p className="text-caption text-muted">Post to your timeline</p>
            </div>
          </button>

          {/* Share to Threads */}
          <button
            onClick={shareToThreads}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-s1 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-s2 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-muted group-hover:text-text transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.18.408-2.285 1.33-3.11.88-.788 2.12-1.272 3.594-1.4.936-.082 1.857-.03 2.721.134-.09-.585-.282-1.08-.574-1.47-.496-.66-1.296-1.009-2.385-1.041h-.036c-.9.025-1.632.3-2.175.817l-1.406-1.488c.88-.833 2.04-1.282 3.457-1.34h.062c1.636.047 2.907.593 3.78 1.625.775.919 1.2 2.15 1.263 3.663.53.099 1.038.236 1.512.412 1.229.456 2.217 1.218 2.856 2.2.818 1.257 1.073 2.855.717 4.5-.46 2.13-1.771 3.826-3.794 4.908C17.725 23.484 15.19 24.02 12.186 24z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text">Share on Threads</p>
              <p className="text-caption text-muted">Post to your feed</p>
            </div>
          </button>
        </div>
        </>
      )}
    </div>
  )
}
