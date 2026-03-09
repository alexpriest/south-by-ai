import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const generateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  prefix: 'ratelimit:gen',
})

const refineLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(200, '1 h'),
  prefix: 'ratelimit:refine',
})

export async function checkGenerateLimit(ip: string): Promise<boolean> {
  const { success } = await generateLimiter.limit(ip)
  return success
}

export async function checkRefineLimit(ip: string): Promise<boolean> {
  const { success } = await refineLimiter.limit(ip)
  return success
}

const swapLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  prefix: 'ratelimit:swap',
})

export async function checkSwapLimit(ip: string): Promise<boolean> {
  const { success } = await swapLimiter.limit(ip)
  return success
}
