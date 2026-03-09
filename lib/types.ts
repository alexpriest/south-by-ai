export interface Session {
  id: string
  title: string
  description?: string
  track: string
  type: string
  format: string
  date: string
  startTime: string
  endTime: string
  venue: string
  speakers: string[]
  url: string
  tags: string[]
  imageUrl?: string | null
  badgeTypes: string[]
}

export interface ScheduleSession extends Session {
  reason: string
  priority: number
}

export interface QuizState {
  name: string
  badge: string
  interests: string[]
  vibes: string[]
  days: string[]
  freeText: string
}

export interface DaySchedule {
  date: string
  label: string
  sessions: ScheduleSession[]
}

export interface StoredSchedule {
  id: string
  name: string
  preferences: QuizState
  days: DaySchedule[]
  chatHistory: ChatMessage[]
  createdAt: string
  editSecret?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
