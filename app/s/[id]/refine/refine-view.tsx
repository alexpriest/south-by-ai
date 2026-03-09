'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatInterface } from '@/components/chat/chat-interface'
import type { StoredSchedule, ChatMessage } from '@/lib/types'

interface RefineViewProps {
  schedule: StoredSchedule
}

export function RefineView({ schedule }: RefineViewProps) {
  const router = useRouter()

  const greeting: ChatMessage = {
    role: 'assistant',
    content: `Hey ${schedule.name}! Here's your schedule based on your quiz answers. Want changes? Tell me what to add, drop, or rearrange.`,
  }

  const initialMessages: ChatMessage[] = [
    greeting,
    ...schedule.chatHistory,
  ]

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-accent uppercase tracking-wider mb-0.5">Refine</p>
            <h1 className="font-heading text-xl font-bold">Tweak Your Schedule</h1>
          </div>
          <Link
            href={`/s/${schedule.id}`}
            className="bg-white/10 text-white rounded-full px-6 py-2.5 text-sm hover:bg-white/20 transition-colors"
          >
            View Schedule
          </Link>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
          <ChatInterface
            scheduleId={schedule.id}
            initialMessages={initialMessages}
            onScheduleUpdate={() => router.refresh()}
          />
        </div>
      </div>
    </main>
  )
}
