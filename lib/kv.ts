import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import type { StoredSchedule } from './types'

export function generateId(): string {
  return nanoid(10)
}

export async function saveSchedule(schedule: StoredSchedule): Promise<void> {
  await kv.set(`schedule:${schedule.id}`, schedule)
}

export async function getSchedule(id: string): Promise<StoredSchedule | null> {
  return kv.get<StoredSchedule>(`schedule:${id}`)
}
