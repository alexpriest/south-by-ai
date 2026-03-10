import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export function getClientIP(request: Request): string {
  // On Vercel, x-real-ip is set by the platform and cannot be spoofed by clients.
  // x-forwarded-for is client-spoofable, so we only use x-real-ip.
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  // Fallback: hash identifying headers to create a pseudo-unique bucket
  const ua = request.headers.get('user-agent') || ''
  const lang = request.headers.get('accept-language') || ''
  const raw = `${ua}:${lang}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  }
  return `anon:${hash.toString(36)}`
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

const swapLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  prefix: 'ratelimit:swap',
})

const globalDailyLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5000, '24 h'),
  prefix: 'ratelimit:global',
})

export async function checkGenerateLimit(ip: string): Promise<boolean> {
  const { success } = await generateLimiter.limit(ip)
  if (!success) return false
  const { success: globalOk } = await globalDailyLimiter.limit('global')
  return globalOk
}

export async function checkRefineLimit(ip: string): Promise<boolean> {
  const { success } = await refineLimiter.limit(ip)
  if (!success) return false
  const { success: globalOk } = await globalDailyLimiter.limit('global')
  return globalOk
}

export async function checkSwapLimit(ip: string): Promise<boolean> {
  const { success } = await swapLimiter.limit(ip)
  return success
}
