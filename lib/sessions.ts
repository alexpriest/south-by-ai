import { unstable_cache } from 'next/cache'
import type { Session } from './types'
import sessionsData from '@/data/sessions.json'

export const getSessions = unstable_cache(
  async (): Promise<Session[]> => {
    return sessionsData as Session[]
  },
  ['sxsw-sessions'],
  { revalidate: false }
)
