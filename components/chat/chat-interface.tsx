'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import type { ChatMessage } from '@/lib/types'

const SUGGESTIONS = [
  'Add more AI sessions',
  'Free up Friday afternoon',
  'I want live music every night',
  'Less panels, more networking',
  'Swap in some food events',
]

interface ChatInterfaceProps {
  scheduleId: string
  initialMessages: ChatMessage[]
  onScheduleUpdate: () => void
}

export function ChatInterface({ scheduleId, initialMessages, onScheduleUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  // Auto-focus input on mount and after sending
  useEffect(() => {
    if (!sending) {
      inputRef.current?.focus()
    }
  }, [sending])

  const send = async (text: string) => {
    if (!text.trim() || sending) return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, message: text.trim(), editToken: localStorage.getItem(`editToken:${scheduleId}`) }),
      })

      if (!res.ok) throw new Error('Failed to refine')

      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      onScheduleUpdate()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'That didn\'t work. Give it another shot.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-s1 border border-b1 rounded-xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="bg-s1 border border-b1 rounded-full px-4 py-2 text-sm text-muted hover:bg-s2 hover:text-text hover:border-bh transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex gap-2 sticky bottom-0 bg-background py-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me what to change..."
          disabled={sending}
          aria-label="Chat message"
          className="flex-1 bg-s1 border border-b1 rounded-xl px-5 py-3 text-sm text-text placeholder:text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/25 focus:outline-none disabled:opacity-50 transition-colors duration-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-primary text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}
