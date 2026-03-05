export function getSpeakerUrl(name: string): string {
  return `https://schedule.sxsw.com/2026/search/speaker?q=${encodeURIComponent(name)}`
}
