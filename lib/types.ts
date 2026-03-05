export interface Session {
  id: string
  title: string
  description: string
  track: string
  format: string
  date: string
  start_time: string
  end_time: string
  venue: string
  speakers: string[]
  url: string
  tags: string[]
}

export interface ScheduleSession extends Session {
  reason: string
}

export interface QuizState {
  name: string
  interests: string[]
  vibe: string
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
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
