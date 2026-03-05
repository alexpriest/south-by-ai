# South by AI — Full Implementation Plan (Autonomous)

> **For Claude:** This plan is designed to run autonomously with `--dangerously-skip-permissions`. You are the CEO/PM. Create a team, dispatch subagents, and do not stop until you have a working prototype deployed to Vercel. Do NOT ask the user any questions — make decisions yourself and move fast.

**Goal:** Ship an AI-powered SXSW 2026 schedule builder. Quiz → personalized schedule via Claude → chat refinement → shareable links with OG images. Must be live before Sunday March 9.

**Architecture:** Next.js 14 App Router. Stub auth (name input, no OAuth for prototype). Claude API server-side. SXSW schedule scraped via Playwright CLI and stored as static JSON. Schedules persisted in Vercel KV (Upstash). OG images via `@vercel/og`. Deployed on Vercel.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, Anthropic SDK (`@anthropic-ai/sdk`), `@vercel/kv`, `@vercel/og`, Playwright (scraping), Space Grotesk + Inter fonts, nanoid

**Working Directory:** `~/Code/projects/south-by-ai`

**Environment:** `.env.local` already contains `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and other Vercel KV vars. `ANTHROPIC_API_KEY` is in the shell environment. The Vercel project `south-by-ai` is already linked.

---

## Team Structure

Create a team called `south-by-ai` and dispatch these agents:

### Core Team (you manage directly)

| Role | Agent Name | Type | Responsibility |
|------|-----------|------|----------------|
| **CEO/PM** | You (leader) | — | Orchestrate all agents, make decisions, review work, unblock issues |
| **Scraper** | `scraper` | `general-purpose` | Scrape SXSW schedule data using Playwright CLI. Exploratory — inspect DOM, find selectors, extract all sessions |
| **Engineer 1** | `eng-scaffold` | `general-purpose` | Project scaffolding, Tailwind config, fonts, global styles, KV helpers |
| **Engineer 2** | `eng-frontend` | `general-purpose` | Quiz flow components, schedule view, chat UI — all React components |
| **Engineer 3** | `eng-api` | `general-purpose` | API routes (generate, refine), Claude integration, KV storage, OG image |
| **Designer 1** | `designer-ui` | `general-purpose` | Primary UI design — landing page, quiz, schedule view, chat. Use `/frontend-design` skill |
| **Designer 2** | `designer-audit` | `general-purpose` | Audit and improve Designer 1's work. Use `/frontend-design` skill. Fix issues, elevate quality |
| **Designer 3** | `designer-ux` | `general-purpose` | UX and interaction design — animations, transitions, loading states, mobile responsiveness. Use `/frontend-design` skill |
| **Designer 4** | `designer-brand` | `general-purpose` | Branding — logo, color system, OG image design, share card design, favicon. Use `/frontend-design` skill |
| **Copywriter** | `copywriter` | `general-purpose` | All copy — headlines, quiz labels, loading messages, error messages, meta descriptions, share text. Use `/copywriting` skill |
| **Copy Editor** | `copy-editor` | `general-purpose` | Review and improve all copy from Copywriter. Tighten, sharpen, ensure voice consistency |
| **Code Reviewer 1** | `reviewer-1` | `general-purpose` | Review code after each major milestone. Use `/code-review` skill |
| **Code Reviewer 2** | `reviewer-2` | `general-purpose` | Final code review before deploy. Use `/code-review` skill |
| **Code Simplifier** | `simplifier` | `general-purpose` | End-of-project cleanup. Use `/simplify` skill. Remove dead code, simplify over-engineering |
| **QA / Tester** | `qa` | `general-purpose` | End-to-end testing with Playwright CLI. Use `/webapp-testing` or `playwright-skill`. Verify full flow works |

### Agent Dispatch Rules

1. **Run agents in worktrees** (`isolation: "worktree"`) when they touch the same files. Engineers working on different directories can share the main branch.
2. **Scraper runs first** — all other work can proceed in parallel, but the generate API needs `data/sessions.json` to be complete.
3. **Designers work AFTER initial components exist** — they need code to improve, not blank files.
4. **Copy team works in parallel** with designers — copy can be written to a spec file first, then integrated.
5. **Code reviewers activate at milestones** — after scaffold+data, after frontend+API, and before final deploy.
6. **QA runs last** — after all features are integrated and deployed to preview.

---

## Execution Phases

### Phase 0: Setup (you, synchronous)

1. Create the team with `TeamCreate`
2. Create all tasks with `TaskCreate`
3. Set up task dependencies with `TaskUpdate` (blockedBy)

### Phase 1: Foundation (parallel)

Dispatch simultaneously:

- **`eng-scaffold`**: Task 1 — scaffold Next.js project, install deps, configure Tailwind/fonts/dark theme, create `.env.local.example`, verify dev server starts, commit
- **`scraper`**: Task 2 — scrape SXSW schedule using Playwright CLI (`npx playwright install chromium` first). Strategy: load `https://schedule.sxsw.com/2026/search/event` in headed mode, inspect the rendered DOM (it's a React SPA), find event card selectors, paginate through all results, extract title/description/track/time/date/venue/speakers/url. Save to `data/sessions.json`. Expect 500-900 sessions. This is exploratory — iterate until data is good.
- **`copywriter`**: Task 3 — write ALL copy to `docs/copy.md`. Headlines, subheads, quiz step labels, quiz option labels, loading messages (5 rotating), error messages, share text, meta descriptions, OG image text, footer text. Voice: confident, fun, slightly irreverent. Not corporate.
- **`designer-brand`**: Task 4 — create brand assets. Logo (SVG, text-based "SOUTH BY AI"), favicon, color system documentation in `docs/brand.md`. Define the glassmorphism card style, button styles, chip styles. Create a simple brand guide.

**Gate:** eng-scaffold must complete before eng-frontend and eng-api start. Scraper must complete before eng-api can build the generate endpoint.

### Phase 2: Core Build (parallel, after Phase 1 gate)

Dispatch simultaneously:

- **`eng-frontend`**: Task 5 — build all React components:
  - Quiz flow: `components/quiz/quiz-flow.tsx` (state machine), `interest-chips.tsx`, `vibe-select.tsx`, `day-picker.tsx`, `free-text.tsx`, `name-input.tsx`
  - Landing page: `app/page.tsx` with hero + quiz
  - Schedule view: `app/s/[id]/page.tsx`, `components/schedule/day-view.tsx`, `session-card.tsx`, `share-button.tsx`
  - Chat: `app/s/[id]/refine/page.tsx`, `components/chat/chat-interface.tsx`, `message-bubble.tsx`
  - Use placeholder data for schedule view until API is ready. Wire up form submission to POST `/api/generate`.

- **`eng-api`**: Task 6 — build all API routes and server logic:
  - `lib/kv.ts` — KV helpers (save/get schedule, generate ID with nanoid)
  - `lib/claude.ts` — Claude prompt builder + parser. Use `claude-sonnet-4-5-20250514` model. Prompt includes filtered session list + preferences. Request structured JSON output.
  - `lib/types.ts` — shared TypeScript types (QuizState, Session, DaySchedule, StoredSchedule, etc.)
  - `app/api/generate/route.ts` — POST endpoint: parse preferences, load sessions from `data/sessions.json`, call Claude, save to KV, return schedule ID
  - `app/api/refine/route.ts` — POST endpoint: load schedule from KV, send to Claude with chat history + new message, save updated schedule, return updated data
  - `app/s/[id]/opengraph-image.tsx` — OG image generation with `@vercel/og`
  - No auth check — stub auth means we just use the name from the quiz

- **`copy-editor`**: Task 7 — review `docs/copy.md` from copywriter. Tighten everything. Make loading messages more fun. Make error messages human. Ensure quiz labels are ultra-clear.

### Phase 3: Design Pass (after Phase 2 components exist)

Dispatch simultaneously:

- **`designer-ui`**: Task 8 — primary design pass on all pages. Apply the brand guide from designer-brand. Style the landing hero, quiz flow, schedule view, chat interface. Use the color palette (dark #0A0A0A, orange #FF6B35, teal #00D4AA, off-white #F5F5F5). Glassmorphism cards. Space Grotesk headings. Use `/frontend-design` skill.

- **`designer-ux`**: Task 9 — UX and interaction pass. Add:
  - Smooth step transitions in quiz (slide/fade)
  - Loading animation with rotating messages during schedule generation
  - Skeleton loading for schedule page
  - Typing indicator in chat
  - "Copied!" toast on share
  - Mobile-first responsive design (test at 375px and 390px)
  - Scroll behaviors, focus management, keyboard navigation
  Use `/frontend-design` skill.

- **`reviewer-1`**: Task 10 — mid-project code review. Review all code written in Phase 1-2. Check for: TypeScript errors, missing error handling, security issues (no API key leaks, no XSS), proper async/await, correct Vercel KV usage. Use `/code-review` skill.

### Phase 4: Integration + Polish

- **`designer-audit`**: Task 11 — audit all design work from designer-ui and designer-ux. Look for inconsistencies, rough edges, accessibility issues. Fix and elevate. Use `/frontend-design` skill.

- **`eng-frontend`** (resumed or new agent): Task 12 — integrate copy from `docs/copy.md` into all components. Replace placeholder text with final copy. Integrate any design changes from the design team.

### Phase 5: Deploy + QA

- **`eng-api`** (resumed or new agent): Task 13 — deploy to Vercel:
  - Create GitHub repo: `gh repo create south-by-ai --private --source=. --remote=origin --push`
  - Deploy: `npx vercel --prod`
  - Verify env vars are set in Vercel dashboard (KV vars should auto-populate since project is linked)
  - Add `ANTHROPIC_API_KEY` to Vercel env vars if not already there
  - Test production URL

- **`qa`**: Task 14 — end-to-end QA using Playwright CLI / webapp-testing skill:
  - Full flow: landing → enter name → quiz → generate → view schedule → share → refine
  - Test mobile viewport (375px)
  - Test OG image renders at `/s/[id]/opengraph-image`
  - Test error states (invalid schedule ID, empty quiz submission)
  - Test share URL works when opened in new incognito window
  - Report all bugs

- **`reviewer-2`**: Task 15 — final code review before ship. Full codebase review. Check for: dead code, console.logs, hardcoded values, missing error handling, TypeScript strictness. Use `/code-review` skill.

- **`simplifier`**: Task 16 — final cleanup. Use `/simplify` skill. Remove dead code, unnecessary abstractions, over-engineering. Make sure the codebase is clean and readable.

### Phase 6: Bug Fixes + Ship

- **`eng-frontend`** or **`eng-api`**: Task 17 — fix all bugs reported by QA, reviewer-2, and simplifier. Re-deploy. Verify fixes.

---

## Task Dependency Graph

```
Phase 1 (parallel):
  Task 1 (scaffold)     ─┐
  Task 2 (scrape)       ─┤── Gate: both must complete
  Task 3 (copy)          │
  Task 4 (brand)         │
                         │
Phase 2 (parallel):      │
  Task 5 (frontend) ←───┘ blocked by Task 1
  Task 6 (API) ←───────── blocked by Task 1 + Task 2
  Task 7 (copy edit) ←─── blocked by Task 3

Phase 3 (parallel):
  Task 8 (design-ui) ←─── blocked by Task 5
  Task 9 (design-ux) ←─── blocked by Task 5
  Task 10 (review-1) ←─── blocked by Task 5 + Task 6

Phase 4:
  Task 11 (design-audit) ← blocked by Task 8 + Task 9
  Task 12 (integrate) ←─── blocked by Task 7 + Task 11

Phase 5 (parallel):
  Task 13 (deploy) ←────── blocked by Task 12
  Task 14 (QA) ←─────────── blocked by Task 13
  Task 15 (review-2) ←──── blocked by Task 12
  Task 16 (simplify) ←──── blocked by Task 15

Phase 6:
  Task 17 (bug fixes) ←─── blocked by Task 14 + Task 16
```

---

## Key Technical Decisions (Pre-Made)

These decisions are FINAL. Do not ask the user about them:

1. **No OAuth** — stub auth with a name input field. No Google, no Twitter. Ship fast.
2. **Vercel KV** — already configured in `.env.local`. Use `@vercel/kv` package.
3. **Claude model** — use `claude-sonnet-4-5-20250514` for schedule generation (fast, cheap, good enough).
4. **Playwright for scraping** — use Playwright CLI (`npx playwright`). The SXSW site is a React SPA, so you need a real browser.
5. **No test suite** — QA agent does manual E2E testing. No Jest/Vitest for prototype.
6. **Static session data** — scrape once, bundle as JSON. Don't re-scrape at runtime.
7. **Single KV store** — one Upstash Redis for everything (schedules + user data).
8. **Vercel deploy** — project already linked. Just `npx vercel --prod`.

## Scraper Strategy (Critical Path)

The SXSW schedule at `schedule.sxsw.com` is a React SPA. Key findings from reconnaissance:

- The site uses React Router + a custom API at `/api/web/*` (authenticated, returns 401 without session)
- Individual event pages have OG meta tags: `og:title` and `og:description` with full session info
- The search page at `/2026/search/event` renders event cards dynamically via JS
- The main content div is `<div class='app-container-fluid reactive event' id='app'>`

**Recommended scraper approach:**
1. Use Playwright to load the search page with `waitUntil: 'networkidle'`
2. Set up route interception to capture any `/api/web/*` JSON responses the SPA makes
3. If API interception works, use that data directly
4. If not, fall back to scraping the rendered DOM — find event card elements, extract text content
5. Paginate through all results (look for "Load More" or infinite scroll)
6. For each event, you may need to visit the individual event page (`/2026/events/PP{id}`) to get full details
7. As a last resort, scrape OG meta tags from individual event pages (slower but reliable)

The scraper agent should run `headless: false` first to visually inspect the page, then switch to `headless: true` once selectors are confirmed.

## Copy Voice Guide

For the copywriter:

- **Confident and fun**, not corporate
- **Slightly irreverent** — "850+ sessions. You're not reading all those descriptions."
- **Direct** — short sentences, active voice
- **SXSW-native** — assume the reader knows what SXSW is
- **Loading messages** should be entertaining, not generic. Examples: "Teaching AI about Austin traffic...", "Debating whether Amy Webb or Tristan Harris is more your vibe...", "Calculating optimal taco break windows..."

## Design System Reference

For all designers:

- **Background:** `#0A0A0A`
- **Primary (orange):** `#FF6B35` — CTAs, selected states, brand elements
- **Accent (teal):** `#00D4AA` — secondary actions, highlights, links
- **Text:** `#F5F5F5` — primary text
- **Muted:** `#6B7280` — secondary text, timestamps
- **Card BG:** `rgba(255, 255, 255, 0.05)` with `backdrop-blur-md`
- **Card Border:** `rgba(255, 255, 255, 0.1)`
- **Headings:** Space Grotesk (bold)
- **Body:** Inter
- **Border radius:** `rounded-xl` (12px) for cards, `rounded-full` for chips/badges
- **Transitions:** 200ms ease for hovers, 300ms for page transitions
