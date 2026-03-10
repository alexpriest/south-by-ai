# South by AI

AI-powered schedule builder for SXSW 2026. Take a 60-second quiz about your interests, get a personalized schedule from 4,000+ sessions, refine it through conversation, and share it with a link.

**[south-by-ai.vercel.app](https://south-by-ai.vercel.app)**

## How it works

1. **Quiz** — 6 quick questions: your name, badge type, interests, vibes, days attending, and anything else you want
2. **Generate** — Claude reads through the full SXSW catalog and builds a schedule tailored to your answers
3. **Refine** — Chat to adjust ("more music sessions", "nothing before 11am", "swap this for something shorter")
4. **Share** — Unique link with social preview image, no account needed

## Stack

- **Next.js 15** (App Router, Server Components) + TypeScript
- **Claude API** for schedule generation and conversational refinement
- **Vercel KV** (Upstash Redis) for schedule storage
- **Tailwind CSS** with a custom dark-mode design system
- Deployed on **Vercel**

## Development

```bash
npm install
npm run dev
```

Requires `.env.local` with `ANTHROPIC_API_KEY`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN`.

## Design

Dark theme with orange (`#FF6B35`) and teal (`#00D4AA`) accents. Space Grotesk headings, Inter body text. Glassmorphism cards. Mobile-first, responsive from 375px up.

Three schedule views: day (chronological), timeline (visual time blocks), and map (sessions plotted on OpenStreetMap).
