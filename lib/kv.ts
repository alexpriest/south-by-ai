import { cache } from 'react'
import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import type { StoredSchedule } from './types'

export function generateId(): string {
  return nanoid(10)
}

export function generateEditSecret(): string {
  return nanoid(21)
}

export async function saveSchedule(schedule: StoredSchedule): Promise<{ editToken: string }> {
  if (!schedule.editToken) {
    schedule.editToken = nanoid(24)
  }
  await kv.set(`schedule:${schedule.id}`, schedule, { ex: 60 * 60 * 24 * 30 })
  return { editToken: schedule.editToken }
}

export async function getSchedule(id: string): Promise<StoredSchedule | null> {
  return kv.get<StoredSchedule>(`schedule:${id}`)
}

export const getCachedSchedule = cache(async (id: string): Promise<StoredSchedule | null> => {
  return kv.get<StoredSchedule>(`schedule:${id}`)
})
