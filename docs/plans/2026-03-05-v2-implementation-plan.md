# South by AI v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace mock data with live SXSW schedule (3,755 events via API), add calendar/timeline view, add category browsing page.

**Architecture:** Fetch from SXSW's internal search API (`POST /2026/search`) with ISR caching (15-min revalidate). Add timeline visualization and browse-by-track pages. Keep existing quiz/chat/share flow.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, `@anthropic-ai/sdk`, `@vercel/kv`, `unstable_cache` from `next/cache`

**Working Directory:** `~/Code/projects/south-by-ai`

**No test suite** — prototype. QA agent does manual E2E testing.

---

## Team Structure

| Role | Agent Name | Type | Task |
|------|-----------|------|------|
| **CEO/PM** | You (leader) | — | Orchestrate, review, unblock |
| **Data Engineer** | `eng-data` | `general-purpose` | Tasks 1-2: Live SXSW fetch, types, track colors |
| **Frontend 1** | `eng-timeline` | `general-purpose` | Tasks 3-4: Timeline view, view toggle |
| **Frontend 2** | `eng-browse` | `general-purpose` | Tasks 5-6: Browse pages, quiz update |
| **Integrator** | `eng-integrate` | `general-purpose` | Task 7: Wire everything together, fix build |
| **Designer** | `designer` | `general-purpose` | Task 8: Design pass on new views |
| **QA** | `qa` | `general-purpose` | Task 9: Full E2E testing |
| **Deployer** | `eng-deploy` | `general-purpose` | Task 10: Deploy + verify |

## Execution Phases

```
Phase 1 (parallel):
  Task 1 (live data)    ─┐
  Task 2 (track colors)  │── both must complete
                          │
Phase 2 (parallel):       │
  Task 3 (timeline) ←───┘ blocked by Task 1
  Task 4 (view toggle) ←── blocked by Task 1
  Task 5 (browse) ←─────── blocked by Task 1
  Task 6 (quiz update) ←── blocked by Task 1

Phase 3:
  Task 7 (integration) ←── blocked by Tasks 3-6

Phase 4:
  Task 8 (design) ←──────── blocked by Task 7

Phase 5:
  Task 9 (QA) ←──────────── blocked by Task 8
  Task 10 (deploy) ←─────── blocked by Task 7
```

---

### Task 1: Replace static data with live SXSW API fetch

**Files:**
- Delete: `data/sessions.json`
- Rewrite: `lib/sessions.ts`
- Modify: `lib/types.ts`

**Step 1: Update Session type in `lib/types.ts`**

Add new fields to the Session interface:

```typescript
export interface Session {
  id: string
  title: string
  description: string  // may be empty for some events
  track: string        // SXSW "theme" field — e.g., "Tech & AI", "Design"
  type: string         // "Session", "Screening", "Showcase", etc.
  format: string       // "Panel", "Solo", "Film Screening", etc.
  date: string         // "2026-03-12"
  startTime: string    // "14:00" (Central Time)
  endTime: string      // "15:30" (Central Time)
  venue: string        // "Waller Ballroom A, Austin Marriott Downtown"
  speakers: string[]   // panelist names
  url: string          // "https://schedule.sxsw.com/2026/events/OE46396"
  tags: string[]       // extracted from links
  imageUrl: string | null
  badgeTypes: string[] // "Film & TV Badge", "Innovation Badge", etc.
}
```

Also update `ScheduleSession` to keep extending Session (no change needed there).

**Step 2: Rewrite `lib/sessions.ts` with live SXSW API fetch**

```typescript
import { unstable_cache } from 'next/cache'
import type { Session } from './types'

interface SXSWSource {
  name: string
  event_id: string
  theme: string | null
  event_type: string
  format: string | null
  date: string
  start_time: string
  end_time: string
  venue: { name: string; root: string } | null
  panelists: string[]
  links: { label: string; value: string }[]
  thumbnail_url: string | null
  credential_types: string[]
  primary_credentials: string[]
}

interface SXSWHit {
  _source: SXSWSource
}

interface SXSWResponse {
  hits: SXSWHit[]
}

function toLocalTime(isoString: string): string {
  // SXSW times are in UTC, Austin is CT (UTC-5 during CDT in March)
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Chicago',
  })
}

function toLocalDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }) // YYYY-MM-DD
}

function transformSession(hit: SXSWHit): Session {
  const s = hit._source
  const tags = s.links
    .filter((l) => l.label === 'Tag')
    .map((l) => l.value)

  const venueName = s.venue
    ? s.venue.name !== s.venue.root
      ? `${s.venue.name}, ${s.venue.root}`
      : s.venue.name
    : ''

  return {
    id: s.event_id,
    title: s.name,
    description: '', // search API doesn't include descriptions
    track: s.theme || 'General',
    type: s.event_type,
    format: s.format || s.event_type,
    date: toLocalDate(s.start_time),
    startTime: toLocalTime(s.start_time),
    endTime: toLocalTime(s.end_time),
    venue: venueName,
    speakers: s.panelists || [],
    url: `https://schedule.sxsw.com/2026/events/${s.event_id}`,
    tags,
    imageUrl: s.thumbnail_url || null,
    badgeTypes: s.primary_credentials || [],
  }
}

async function fetchSXSWEvents(): Promise<Session[]> {
  // Step 1: Get session cookie + CSRF token
  const pageRes = await fetch('https://schedule.sxsw.com/2026/search/event', {
    headers: { 'User-Agent': 'SouthByAI/1.0' },
  })

  const cookies = pageRes.headers.getSetCookie?.() || []
  const sessionCookie = cookies
    .find((c) => c.startsWith('_chronos_session='))
    ?.split(';')[0] || ''

  const pageHtml = await pageRes.text()
  const csrfMatch = pageHtml.match(/csrf-token[^>]*content="([^"]*)"/)
  const csrfToken = csrfMatch?.[1] || ''

  if (!csrfToken || !sessionCookie) {
    throw new Error('Failed to get SXSW session/CSRF token')
  }

  // Step 2: Search for all events
  const searchRes = await fetch('https://schedule.sxsw.com/2026/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({
      term: '',
      filters: [],
      models: ['event'],
    }),
  })

  if (!searchRes.ok) {
    throw new Error(`SXSW API returned ${searchRes.status}`)
  }

  const data: SXSWResponse = await searchRes.json()
  return data.hits.map(transformSession)
}

export const getSessions = unstable_cache(
  fetchSXSWEvents,
  ['sxsw-sessions'],
  { revalidate: 900 } // 15 minutes
)
```

**Step 3: Delete `data/sessions.json`**

Remove the file (use `trash`).

**Step 4: Update all callers of `getSessions`**

`getSessions()` is now async (returns `Promise<Session[]>`). Update:
- `app/api/generate/route.ts`: `const sessions = await getSessions()`
- `app/api/refine/route.ts`: `const sessions = await getSessions()`
- Any other file importing from `lib/sessions`

**Step 5: Update Claude prompt in `lib/claude.ts`**

The `start_time` and `end_time` field names in the prompt need to match the new `startTime`/`endTime` camelCase. Also update the `sessionsForPrompt` mapping to use the new field names. Also add `type` to the prompt data so Claude knows what kind of event it is.

**Step 6: Verify build passes**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: replace mock data with live SXSW API fetch (3700+ events, 15-min ISR cache)"
```

---

### Task 2: Create track color mapping

**Files:**
- Create: `lib/track-colors.ts`

**Step 1: Create track color mapping**

```typescript
// Each real SXSW track gets a distinct color for timeline blocks and badges
const TRACK_COLORS: Record<string, string> = {
  'Tech & AI': '#3B82F6',        // blue
  'Design': '#8B5CF6',           // violet
  'Culture': '#EC4899',          // pink
  'Health': '#10B981',           // emerald
  'Creator Economy': '#F59E0B',  // amber
  'Brand & Marketing': '#EF4444', // red
  'Cities & Climate': '#06B6D4', // cyan
  'Startups': '#FF6B35',         // orange (primary)
  'Startups & Investment': '#FF6B35',
  'Sports & Gaming': '#84CC16',  // lime
  'Music': '#A855F7',            // purple
  'Film & TV': '#F43F5E',        // rose
  'Workplace': '#6366F1',        // indigo
  'Global': '#14B8A6',           // teal
  'Headliner': '#00D4AA',        // accent
}

const DEFAULT_COLOR = '#6B7280' // muted gray

export function getTrackColor(track: string): string {
  return TRACK_COLORS[track] || DEFAULT_COLOR
}

export function getTrackNames(): string[] {
  return Object.keys(TRACK_COLORS)
}
```

**Step 2: Commit**

```bash
git add lib/track-colors.ts
git commit -m "feat: add track color mapping for SXSW themes"
```

---

### Task 3: Build timeline view component

**Files:**
- Create: `components/schedule/timeline-view.tsx`
- Create: `components/schedule/timeline-block.tsx`

**Step 1: Build TimelineBlock component**

A single session block in the timeline. Positioned absolutely based on start/end time. Color-coded by track. Expandable on click.

Props: `session: ScheduleSession`, `topPercent: number`, `heightPercent: number`

On click: expand to show description, venue, speakers, AI reason. Click again to collapse.

Use `getTrackColor(session.track)` for the left border and background tint.

**Step 2: Build TimelineView component**

Props: `day: DaySchedule`

- Render a vertical time axis from 09:00 to 23:00 (14 hours)
- Each hour gets a row with a label
- Sessions are positioned absolutely:
  - `top` = (startMinutes - 540) / (14 * 60) * 100%  (540 = 9:00 AM in minutes)
  - `height` = durationMinutes / (14 * 60) * 100%
- Parse `session.startTime` ("14:00") and `session.endTime` ("15:30") to calculate position
- Container has `position: relative` with a fixed height (e.g., 840px = 60px per hour)
- Hour grid lines as horizontal borders
- Time labels on the left (48px wide)
- Session blocks fill the remaining width

Mobile: same layout but blocks are narrower, text smaller.

**Step 3: Commit**

```bash
git add components/schedule/timeline-view.tsx components/schedule/timeline-block.tsx
git commit -m "feat: add timeline/calendar view for schedule"
```

---

### Task 4: Add view toggle to schedule page

**Files:**
- Modify: `app/s/[id]/schedule-view.tsx`

**Step 1: Add view state and toggle**

Add a `viewMode` state: `'list' | 'timeline'`, default to `'timeline'`.

Add toggle buttons in the schedule header (next to Share and Refine buttons):
- Two icon buttons or a segmented control: "Timeline" and "List"
- Active state uses primary color

**Step 2: Conditionally render**

- When `viewMode === 'timeline'`: render `<TimelineView day={activeDay} />`
- When `viewMode === 'list'`: render `<DayView day={activeDay} />` (existing)

**Step 3: Commit**

```bash
git add app/s/[id]/schedule-view.tsx
git commit -m "feat: add timeline/list view toggle on schedule page"
```

---

### Task 5: Build category browse pages

**Files:**
- Create: `app/browse/page.tsx`
- Create: `app/browse/[track]/page.tsx`
- Create: `components/browse/track-card.tsx`
- Create: `components/browse/session-list.tsx`

**Step 1: Build TrackCard component**

Shows track name, session count, colored accent bar. Links to `/browse/[track]`.

**Step 2: Build browse index page (`app/browse/page.tsx`)**

Server component. Calls `await getSessions()`. Groups by track, counts sessions per track. Renders a grid of TrackCard components. Include a link back to home.

**Step 3: Build SessionList component**

Reusable list of session cards (can reuse existing SessionCard but without the AI "reason" field). Add date grouping headers. Add filter controls for event type and date.

**Step 4: Build track detail page (`app/browse/[track]/page.tsx`)**

Server component. URL param is the track name (URL-encoded). Calls `await getSessions()`, filters by track. Renders SessionList. Shows track name as heading with colored accent.

**Step 5: Commit**

```bash
git add app/browse/ components/browse/
git commit -m "feat: add category browse pages with track filtering"
```

---

### Task 6: Update quiz with real SXSW tracks

**Files:**
- Modify: `components/quiz/interest-chips.tsx`

**Step 1: Replace INTERESTS array**

Replace the current hardcoded list with real SXSW tracks + short descriptions:

```typescript
const INTERESTS = [
  { id: 'Tech & AI', label: 'Tech & AI', desc: 'Artificial intelligence, emerging tech, software' },
  { id: 'Design', label: 'Design', desc: 'Product design, UX, creative tools' },
  { id: 'Culture', label: 'Culture', desc: 'Art, social issues, storytelling' },
  { id: 'Health', label: 'Health', desc: 'Wellness, medtech, mental health' },
  { id: 'Creator Economy', label: 'Creator Economy', desc: 'Influencers, platforms, monetization' },
  { id: 'Brand & Marketing', label: 'Brand & Marketing', desc: 'Advertising, brand strategy, growth' },
  { id: 'Cities & Climate', label: 'Cities & Climate', desc: 'Urban planning, sustainability, climate tech' },
  { id: 'Startups', label: 'Startups', desc: 'Founders, venture capital, pitch competitions' },
  { id: 'Sports & Gaming', label: 'Sports & Gaming', desc: 'Esports, sports tech, gaming culture' },
  { id: 'Music', label: 'Music', desc: 'Live music, music industry, artist showcases' },
  { id: 'Film & TV', label: 'Film & TV', desc: 'Screenings, TV premieres, documentary' },
  { id: 'Workplace', label: 'Workplace', desc: 'Future of work, HR tech, remote culture' },
  { id: 'Global', label: 'Global', desc: 'International perspectives, geopolitics' },
  { id: 'Headliner', label: 'Headliner', desc: 'Keynotes and featured speakers' },
]
```

**Step 2: Update chip rendering**

Show the description as a tooltip or subtitle text under each chip label. Make chips slightly larger to accommodate the two-line layout.

**Step 3: Update QuizState type if needed**

The `interests` field in QuizState should now contain real track names (e.g., "Tech & AI" not "AI").

**Step 4: Commit**

```bash
git add components/quiz/interest-chips.tsx
git commit -m "feat: update quiz interests to use real SXSW tracks"
```

---

### Task 7: Integration — wire everything together

**Files:**
- All files from Tasks 1-6
- `components/schedule/session-card.tsx` — make track clickable
- `app/layout.tsx` — add browse to nav if needed
- Fix any type mismatches between new Session shape and existing components

**Step 1: Make track labels clickable in session cards**

In `session-card.tsx`, wrap the track `<span>` in a `<Link href={/browse/${encodeURIComponent(session.track)}}>`

**Step 2: Fix type mismatches**

The Session type changed (camelCase `startTime`/`endTime` instead of snake_case `start_time`/`end_time`). Update ALL references:
- `components/schedule/session-card.tsx`
- `components/schedule/day-view.tsx`
- `lib/claude.ts` (prompt building)
- Any other files referencing `start_time` or `end_time`

**Step 3: Add browse link to schedule header**

Add a "Browse All" link somewhere accessible (e.g., in the schedule page header or footer).

**Step 4: Verify full build**

```bash
npm run build
```

Fix any errors. This is the critical integration step.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate v2 — live data, timeline, browse, updated quiz"
```

---

### Task 8: Design pass on new views

**Files:** All new components from Tasks 2-6

Use `/frontend-design` skill.

Apply the existing brand guide (docs/brand.md) to all new components:
- Timeline blocks: glassmorphism style, track-colored left border
- Browse page: consistent card style, proper spacing
- Track detail page: clean filtering UI
- View toggle: matches existing button styles
- Interest chips with descriptions: clean two-line layout
- Ensure mobile responsiveness on all new views

---

### Task 9: QA testing

Use `/webapp-testing` or `/playwright-skill`.

Test on production after deploy:
1. Landing page loads, quiz shows real SXSW tracks with descriptions
2. Generate a schedule — uses real SXSW data
3. Schedule view: timeline renders correctly, blocks positioned by time
4. View toggle: switch between timeline and list
5. Session links go to real schedule.sxsw.com event pages
6. Browse page: shows all tracks with counts
7. Click a track: shows filtered sessions
8. Track name in session card links to browse page
9. Chat refinement still works
10. Mobile viewport (375px)
11. Share URL works

---

### Task 10: Deploy to Vercel

```bash
npx vercel --prod
```

Verify production URL works. Test the API endpoint returns real SXSW data (not mock).
