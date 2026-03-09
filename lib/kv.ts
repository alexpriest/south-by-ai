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

export function validateEditSecret(schedule: StoredSchedule, secret: string): boolean {
  if (!schedule.editSecret || !secret) return false
  return schedule.editSecret === secret
}

export async function saveSchedule(schedule: StoredSchedule): Promise<void> {
  await kv.set(`schedule:${schedule.id}`, schedule, { ex: 60 * 60 * 24 * 30 })
}

export async function getSchedule(id: string): Promise<StoredSchedule | null> {
  return kv.get<StoredSchedule>(`schedule:${id}`)
}

export const getCachedSchedule = cache(async (id: string): Promise<StoredSchedule | null> => {
  return kv.get<StoredSchedule>(`schedule:${id}`)
})
