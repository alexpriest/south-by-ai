import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export function getClientIP(request: Request): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

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
