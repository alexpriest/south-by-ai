export function safeUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.protocol === 'http:' || u.protocol === 'https:') return url
  } catch {}
  return '#'
}
