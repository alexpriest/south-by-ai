# South by AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship an AI-powered SXSW 2026 schedule builder before Sunday March 9 — quiz flow, personalized schedule via Claude, chat refinement, shareable links with OG images.

**Architecture:** Next.js 14 app with App Router. NextAuth for Google + Twitter OAuth. Claude API (Anthropic SDK) called server-side. SXSW schedule data scraped via Playwright and stored as static JSON. Generated schedules persisted in Vercel KV. OG images generated with `@vercel/og`.

**Tech Stack:** Next.js 14, React, Tailwind CSS, NextAuth.js, Anthropic SDK, Vercel KV, @vercel/og, Playwright (scraping only), Space Grotesk font

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.env.local.example`, `.gitignore`, `README.md`

**Step 1: Initialize Next.js project**

```bash
cd ~/Code/projects/south-by-ai
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Accept defaults. This creates the full scaffold.

**Step 2: Install dependencies**

```bash
npm install next-auth @auth/core @anthropic-ai/sdk @vercel/kv @vercel/og nanoid
npm install -D playwright @playwright/test
```

**Step 3: Set up Space Grotesk font in `app/layout.tsx`**

Replace the default font import with:

```tsx
import { Space_Grotesk, Inter } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading'
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body'
})
```

Apply both as className on `<html>`.

**Step 4: Set up Tailwind theme in `tailwind.config.ts`**

Extend theme with:
```ts
colors: {
  background: '#0A0A0A',
  primary: '#FF6B35',
  accent: '#00D4AA',
  foreground: '#F5F5F5',
  muted: '#6B7280',
  'card-bg': 'rgba(255, 255, 255, 0.05)',
  'card-border': 'rgba(255, 255, 255, 0.1)',
},
fontFamily: {
  heading: ['var(--font-heading)', 'sans-serif'],
  body: ['var(--font-body)', 'sans-serif'],
},
```

**Step 5: Set up global styles in `app/globals.css`**

Dark background, base text color, glassmorphism card utility class.

**Step 6: Create `.env.local.example`**

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

**Step 7: Create `.gitignore`**

Ensure `.env.local`, `node_modules`, `.next`, `out` are ignored.

**Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: App running at localhost:3000 with dark background.

**Step 9: Commit**

```bash
git add -A
git commit -m "scaffold: Next.js project with Tailwind, dark theme, dependencies"
```

---

### Task 2: Scrape SXSW Schedule Data

**Files:**
- Create: `scripts/scrape-sxsw.ts`, `data/sessions.json`

**Context:** The SXSW schedule site (schedule.sxsw.com) is a React SPA. Individual event pages have OG meta tags with title and description. The search page loads events dynamically. We need Playwright to:
1. Load the search page
2. Intercept the API responses OR scrape the rendered DOM
3. Paginate through all events
4. Extract: title, description, track, time, date, venue, speakers, event URL

**Step 1: Write the scraper script**

```typescript
// scripts/scrape-sxsw.ts
import { chromium } from 'playwright'
import * as fs from 'fs'

interface Session {
  id: string
  title: string
  description: string
  track: string
  date: string        // "2026-03-13"
  startTime: string   // "09:00"
  endTime: string     // "10:00"
  venue: string
  speakers: string[]
  url: string
  type: string        // "Session", "Keynote", "Workshop", etc.
}

async function scrape() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const sessions: Session[] = []

  // Strategy: Load the search page, intercept API responses
  // The SPA makes fetch calls to /api/web/* endpoints
  // We'll intercept those and capture the JSON data

  // Alternative: scrape the rendered event cards from the search results
  // and then visit each event page for full details

  await page.goto('https://schedule.sxsw.com/2026/search/event', {
    waitUntil: 'networkidle'
  })

  // Wait for events to render
  await page.waitForSelector('.event-card, .search-result, [class*="event"]', {
    timeout: 10000
  })

  // TODO: The exact selectors will depend on what the page renders.
  // Run the scraper, inspect the DOM, and adjust selectors accordingly.
  // This is inherently a manual-inspection step.

  // Paginate through all results
  // Extract event data from each card/row
  // For each event, visit the detail page if needed for full description

  await browser.close()

  fs.writeFileSync(
    'data/sessions.json',
    JSON.stringify(sessions, null, 2)
  )
  console.log(`Scraped ${sessions.length} sessions`)
}

scrape()
```

**Step 2: Run the scraper interactively with headed browser first**

```bash
npx playwright install chromium
npx tsx scripts/scrape-sxsw.ts
```

Inspect the DOM manually (change `headless: false`), find the right selectors, refine the script. This is an exploratory step — expect 2-3 iterations.

**Step 3: Verify data quality**

```bash
cat data/sessions.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); console.log('Total:', j.length); console.log('Sample:', JSON.stringify(j[0], null, 2))"
```

Expected: 500-900 sessions, each with title, time, venue, track.

**Step 4: Commit**

```bash
git add scripts/scrape-sxsw.ts data/sessions.json
git commit -m "data: scrape SXSW 2026 schedule (N sessions)"
```

---

### Task 3: Auth Setup (NextAuth with Google + Twitter)

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`, `components/auth-button.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create auth config in `lib/auth.ts`**

```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
}
```

**Step 2: Create route handler in `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Create session provider wrapper**

Create `components/providers.tsx` with SessionProvider, wrap layout.

**Step 4: Create `components/auth-button.tsx`**

Sign in / sign out button using `signIn()` and `signOut()` from next-auth/react.

**Step 5: Set up Google OAuth credentials**

Go to Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID.
Redirect URI: `http://localhost:3000/api/auth/callback/google`
Add client ID and secret to `.env.local`.

**Step 6: Set up Twitter OAuth credentials**

Go to Twitter Developer Portal → Create app → Enable OAuth 2.0.
Redirect URI: `http://localhost:3000/api/auth/callback/twitter`
Add client ID and secret to `.env.local`.

**Step 7: Generate NEXTAUTH_SECRET**

```bash
openssl rand -base64 32
```

Add to `.env.local`.

**Step 8: Test login flow**

```bash
npm run dev
```

Visit localhost:3000, click sign in, verify Google login works. Verify session persists.

**Step 9: Commit**

```bash
git add lib/auth.ts app/api/auth/ components/providers.tsx components/auth-button.tsx
git commit -m "auth: NextAuth with Google + Twitter OAuth"
```

---

### Task 4: Landing Page + Quiz Flow

**Files:**
- Create: `app/page.tsx` (replace), `components/quiz/quiz-flow.tsx`, `components/quiz/interest-chips.tsx`, `components/quiz/vibe-select.tsx`, `components/quiz/day-picker.tsx`, `components/quiz/free-text.tsx`, `components/quiz/name-input.tsx`

**Step 1: Build the quiz state machine**

`components/quiz/quiz-flow.tsx` — manages quiz steps 1-5 with state:

```typescript
interface QuizState {
  interests: string[]    // multi-select
  vibe: string           // single-select
  days: string[]         // multi-select
  freeText: string       // optional
  name: string           // required
}
```

Steps transition forward/back. Final step submits to API route.

**Step 2: Build interest chips component**

`components/quiz/interest-chips.tsx` — multi-select chip buttons:
- Tech/AI, Startups, Music, Film, Creator Economy, Design, Culture, Health/Wellness
- Glassmorphism style, primary color when selected, teal glow

**Step 3: Build vibe selector**

`components/quiz/vibe-select.tsx` — three card options:
- Deep dives (long sessions)
- Rapid-fire (short talks + networking)
- Mix of both

**Step 4: Build day picker**

`components/quiz/day-picker.tsx` — toggle buttons for:
- Thu Mar 13, Fri Mar 14, Sat Mar 15, Sun Mar 16
- (Optional: Wed Mar 12 for EDU crossover)

**Step 5: Build free text input**

`components/quiz/free-text.tsx` — textarea with placeholder: "Anything specific? e.g., 'I heard Amy Webb is good' or 'defense tech stuff'"

**Step 6: Build name input**

`components/quiz/name-input.tsx` — simple text input, pre-fill from auth session if available.

**Step 7: Build landing hero**

Update `app/page.tsx` with:
- "South by AI" heading in Space Grotesk
- Subhead: "850+ sessions. 4 days. Let AI build your perfect SXSW schedule."
- CTA → starts quiz (or prompts login first)
- Quiz flow renders below hero

**Step 8: Test the full quiz flow**

```bash
npm run dev
```

Walk through all 5 steps. Verify state persists, chips toggle, days select. Submit button is wired (console.log for now).

**Step 9: Commit**

```bash
git add app/page.tsx components/quiz/
git commit -m "feat: landing page and quiz flow"
```

---

### Task 5: Schedule Generation API

**Files:**
- Create: `app/api/generate/route.ts`, `lib/claude.ts`, `lib/schedule.ts`, `lib/kv.ts`

**Step 1: Create KV helpers in `lib/kv.ts`**

```typescript
import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'

export interface StoredSchedule {
  id: string
  userId: string
  name: string
  preferences: QuizState
  schedule: DaySchedule[]
  chatHistory: Message[]
  createdAt: number
  updatedAt: number
}

export async function saveSchedule(schedule: StoredSchedule) {
  await kv.set(`schedule:${schedule.id}`, schedule)
  // Add to user's schedule list
  await kv.sadd(`user:${schedule.userId}:schedules`, schedule.id)
}

export async function getSchedule(id: string) {
  return kv.get<StoredSchedule>(`schedule:${id}`)
}

export function generateId() {
  return nanoid(10)
}
```

**Step 2: Create Claude prompt builder in `lib/claude.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function generateSchedule(
  preferences: QuizState,
  sessions: Session[]
): Promise<DaySchedule[]> {
  // Filter sessions by selected days
  const relevantSessions = sessions.filter(s =>
    preferences.days.includes(s.date)
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: buildPrompt(preferences, relevantSessions)
    }],
  })

  // Parse structured response
  return parseScheduleResponse(response)
}
```

The prompt should:
- Include the filtered session list as JSON
- Describe the user's interests, vibe, and any free text
- Ask for 3-5 sessions per day, no time conflicts
- Request structured JSON output with session IDs, reasoning for each pick
- Ask for walking-context notes (venue changes between sessions)

**Step 3: Create the generate API route**

`app/api/generate/route.ts`:
- Verify auth session
- Parse quiz preferences from request body
- Load sessions from `data/sessions.json`
- Call Claude to generate schedule
- Save to Vercel KV
- Return schedule ID

**Step 4: Wire up quiz form submission**

Update `components/quiz/quiz-flow.tsx` to POST to `/api/generate`, show loading state with rotating messages ("Reviewing 850+ sessions...", "Resolving time conflicts...", "Optimizing your route..."), then redirect to `/s/[id]`.

**Step 5: Test with real Claude API call**

Set `ANTHROPIC_API_KEY` in `.env.local`. Run quiz, submit, verify Claude returns a valid schedule and it saves to KV.

Note: For local dev without Vercel KV, use a simple in-memory Map or a JSON file as fallback.

**Step 6: Commit**

```bash
git add app/api/generate/ lib/claude.ts lib/schedule.ts lib/kv.ts
git commit -m "feat: schedule generation API with Claude"
```

---

### Task 6: Schedule View Page

**Files:**
- Create: `app/s/[id]/page.tsx`, `components/schedule/day-view.tsx`, `components/schedule/session-card.tsx`, `components/schedule/share-button.tsx`

**Step 1: Create schedule page**

`app/s/[id]/page.tsx`:
- Server component that fetches schedule from KV by ID
- If not found, show 404
- Render day tabs + session cards
- No auth required (public URLs)

**Step 2: Build day view component**

`components/schedule/day-view.tsx`:
- Tab bar for each day (Thu/Fri/Sat/Sun)
- Timeline layout showing sessions in order
- Walking time note between sessions if venue changes

**Step 3: Build session card**

`components/schedule/session-card.tsx`:
- Glassmorphism card with:
  - Time (start-end)
  - Session title (bold, Space Grotesk)
  - Venue name
  - Track badge (colored chip)
  - AI reasoning line ("Why this: ...")
  - Link to official SXSW event page

**Step 4: Build share button**

`components/schedule/share-button.tsx`:
- "Share" button that copies URL to clipboard
- Twitter share link (pre-filled text: "Check out my AI-curated SXSW 2026 schedule!")
- LinkedIn share link

**Step 5: Add "Refine" CTA**

Button at bottom: "Want to adjust? Refine with AI" → links to `/s/[id]/refine`

**Step 6: Test schedule view**

Generate a schedule via quiz, verify it renders correctly at `/s/[id]`. Check mobile responsiveness.

**Step 7: Commit**

```bash
git add app/s/ components/schedule/
git commit -m "feat: schedule view page with day tabs and session cards"
```

---

### Task 7: OG Image Generation

**Files:**
- Create: `app/s/[id]/opengraph-image.tsx`

**Step 1: Create OG image route**

Using Next.js App Router convention, `app/s/[id]/opengraph-image.tsx` automatically generates the OG image for any schedule URL.

```tsx
import { ImageResponse } from 'next/og'
import { getSchedule } from '@/lib/kv'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const schedule = await getSchedule(params.id)
  if (!schedule) return new Response('Not found', { status: 404 })

  return new ImageResponse(
    (
      <div style={{
        background: '#0A0A0A',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px',
        fontFamily: 'Inter',
      }}>
        <div style={{ color: '#FF6B35', fontSize: 24 }}>SOUTH BY AI</div>
        <div style={{ color: '#F5F5F5', fontSize: 48, marginTop: 20 }}>
          {schedule.name}'s SXSW 2026
        </div>
        {/* Day summaries */}
        {schedule.schedule.map(day => (
          <div key={day.date} style={{ color: '#6B7280', fontSize: 20, marginTop: 12 }}>
            {day.label}: {day.sessions.map(s => s.title).join(' → ')}
          </div>
        ))}
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 'auto' }}>
          Built with South by AI
        </div>
      </div>
    ),
    { ...size }
  )
}
```

**Step 2: Add meta tags to schedule page**

The OG image is automatic with App Router convention, but verify `<title>` and `<meta description>` are set correctly in `app/s/[id]/page.tsx` via `generateMetadata`.

**Step 3: Test OG image**

Visit `http://localhost:3000/s/[id]/opengraph-image` directly to see the rendered image. Test with Twitter Card Validator or opengraph.xyz.

**Step 4: Commit**

```bash
git add app/s/\[id\]/opengraph-image.tsx
git commit -m "feat: OG image generation for shareable schedule cards"
```

---

### Task 8: Chat Refinement

**Files:**
- Create: `app/s/[id]/refine/page.tsx`, `app/api/refine/route.ts`, `components/chat/chat-interface.tsx`, `components/chat/message-bubble.tsx`

**Step 1: Create chat API route**

`app/api/refine/route.ts`:
- Accepts: schedule ID, user message
- Loads current schedule from KV
- Sends to Claude with: current schedule + session data + chat history + new message
- Claude returns updated schedule JSON
- Saves updated schedule to KV
- Returns updated schedule

**Step 2: Build chat interface**

`components/chat/chat-interface.tsx`:
- Message list (scrollable)
- Text input + send button at bottom
- Loading indicator while Claude generates
- Each response updates the schedule view above/beside

**Step 3: Build message bubble**

`components/chat/message-bubble.tsx`:
- User messages right-aligned, muted background
- AI messages left-aligned, card background
- AI messages can include "I swapped X for Y because..." text

**Step 4: Create refine page**

`app/s/[id]/refine/page.tsx`:
- Two-column layout on desktop: schedule on left, chat on right
- Stacked on mobile: schedule on top (collapsed), chat below
- Schedule updates in real-time as chat produces new versions
- Requires auth (redirect to login if not authenticated)

**Step 5: Test full refinement loop**

Generate schedule, go to refine, type "swap the 2pm session for something on creator economy", verify schedule updates.

**Step 6: Commit**

```bash
git add app/s/\[id\]/refine/ app/api/refine/ components/chat/
git commit -m "feat: chat refinement interface"
```

---

### Task 9: Polish + Deploy

**Files:**
- Modify: various components for responsive design, loading states, error handling
- Create: `vercel.json` (if needed for KV config)

**Step 1: Add loading states everywhere**

- Quiz submit: rotating messages animation
- Schedule page: skeleton cards while loading
- Chat: typing indicator while Claude generates
- Share: "Copied!" toast on clipboard copy

**Step 2: Mobile responsiveness pass**

- Quiz: full-width chips, stacked layout
- Schedule: single column, swipeable days
- Chat: full-screen overlay on mobile
- Test at 375px (iPhone SE) and 390px (iPhone 14)

**Step 3: Error handling**

- Claude API failure: "Something went wrong generating your schedule. Try again?"
- KV read failure: "Schedule not found" with link back to home
- Auth failure: redirect to home with error message
- Rate limiting: consider adding basic rate limit on generate endpoint

**Step 4: Create GitHub repo**

```bash
cd ~/Code/projects/south-by-ai
gh repo create south-by-ai --private --source=. --remote=origin --push
```

**Step 5: Deploy to Vercel**

```bash
npx vercel
```

- Link to Vercel project
- Set all environment variables
- Set up Vercel KV store
- Configure custom domain if desired

**Step 6: Test production deployment**

- Full flow: landing → login → quiz → schedule → share → refine
- Test OG image in Twitter Card Validator
- Test on mobile browser
- Check Claude API costs for a few test runs

**Step 7: Final commit**

```bash
git add -A
git commit -m "polish: responsive design, loading states, error handling, deploy config"
```

---

## Priority Order

If time is tight, ship in this order:

1. **Task 1** (scaffold) — 30 min
2. **Task 2** (scrape data) — 1-2 hrs (exploratory)
3. **Task 4** (quiz flow) — 1-2 hrs
4. **Task 5** (generate API) — 1-2 hrs
5. **Task 6** (schedule view) — 1-2 hrs
6. **Task 3** (auth) — 1 hr
7. **Task 7** (OG images) — 30 min
8. **Task 9** (polish + deploy) — 1-2 hrs
9. **Task 8** (chat refinement) — 2-3 hrs ← cut this if behind

**MVP without chat refinement:** Tasks 1-7 + 9 = shippable product with quiz → schedule → share.
