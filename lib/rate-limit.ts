import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export function getClientIP(request: Request): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',').pop()!.trim()
  return 'unknown'
}

const generateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'ratelimit:gen',
})

const refineLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  prefix: 'ratelimit:refine',
})

export async function checkGenerateLimit(ip: string): Promise<boolean> {
  const { success } = await generateLimiter.limit(ip)
  return success
}

const swapLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  prefix: 'ratelimit:swap',
})

export async function checkRefineLimit(ip: string): Promise<boolean> {
  const { success } = await refineLimiter.limit(ip)
  return success
}

export async function checkSwapLimit(ip: string): Promise<boolean> {
  const { success } = await swapLimiter.limit(ip)
  return success
}
