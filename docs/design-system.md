# South by AI — Design System

Comprehensive design system for the AI-powered SXSW 2026 schedule builder. Built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 1. Design Principles

### 1.1 Dark-First, Light-Adaptive

Dark mode is the primary aesthetic. Light mode adapts automatically via semantic CSS custom properties defined in `globals.css` — never via class overrides. The `dark` class on the `<html>` element toggles between two sets of variables, ensuring consistent behavior across all surfaces and borders.

### 1.2 Glassmorphism with Restraint

Translucent surfaces with subtle blur (12px) create depth and visual hierarchy. Applied to cards, session blocks, and interactive elements. Never applied to full-page backgrounds — the page background remains solid to preserve readability.

### 1.3 Progressive Disclosure

The quiz reveals one step at a time, guiding users through a linear flow. Schedules show top picks prominently with full detail. Alternative sessions are compact and de-emphasized (opacity: 0.6) until selected. Chat suggestions appear progressively as the user refines.

### 1.4 Content Density Adapts

Desktop shows timeline with overlapping columns and parallel sessions visible. Mobile simplifies to a list view with day tabs. Map view expands to full width on larger screens. The layout responds to space, not forcing complexity where it doesn't fit.

### 1.5 Accessible by Default

WCAG AA contrast on all text. 44px minimum touch targets on buttons and interactive elements. Full keyboard navigation with visible focus rings. `prefers-reduced-motion` reduces all animations to 0.01ms. Screen readers receive semantic HTML, `aria-` attributes, and labels.

---

## 2. Color System

All theme-dependent colors use CSS custom properties. Light and dark mode values are defined in `:root` and `.dark` blocks in `globals.css`. Tailwind classes reference these via `var()` in `tailwind.config.ts`.

### 2.1 Core Palette

| Token | CSS Variable | Light | Dark | Usage |
|-------|-------------|-------|------|-------|
| `background` | `--color-background` | `#FAFAFA` | `#0A0A0A` | Page background, body |
| `text` | `--color-text` | `#1A1A1A` | `#F5F5F5` | Primary text, headings |
| `muted` | `--color-muted` | `#6B7280` | `#9CA3AF` | Secondary text, timestamps, disabled |
| `primary` | — | `#FF6B35` | `#FF6B35` | CTAs, selected states, brand highlights |
| `accent` | — | `#00D4AA` | `#00D4AA` | Gradient endpoints, decorative accents |
| `accent-readable` | `--accent-readable` | `#059669` | `#00D4AA` | Text links, AI commentary (contrast-safe for all sizes) |

**Contrast Notes:**
- Muted on light background: `#6B7280` / `#FAFAFA` = 5.9:1 ✓
- Muted on dark background: `#9CA3AF` / `#0A0A0A` = 6.3:1 ✓
- Primary (`#FF6B35`) on dark: 3.5:1 — acceptable for large/bold text only, not body
- Always verify new colors at https://webaim.org/resources/contrastchecker/

### 2.2 Surface Tokens

Semantic background colors that adapt automatically. Use these instead of raw opacity classes.

| Token | Tailwind Class | Light | Dark | Usage |
|-------|---|-------|------|-------|
| Surface 1 | `bg-s1` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.05)` | Card backgrounds, input fills, default surfaces |
| Surface 2 | `bg-s2` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.10)` | Hover states, secondary surfaces, kbd badges |
| Surface Hover | `bg-sh` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Active hover backgrounds, interactive hover |
| Surface Active | `bg-sa` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.15)` | Active/pressed states, strong emphasis |
| Surface Subtle | `bg-ss` | `rgba(0,0,0,0.02)` | `rgba(255,255,255,0.03)` | Sidebars, muted sections, light backgrounds |

### 2.3 Border Tokens

Semantic border colors that scale with context. Use instead of raw `border-white/10`.

| Token | Tailwind Class | Light | Dark | Usage |
|-------|---|-------|------|-------|
| Border 1 | `border-b1` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | Default borders, dividers |
| Border 2 | `border-b2` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.15)` | Emphasized borders, stronger separation |
| Border Hover | `border-bh` | `rgba(0,0,0,0.15)` | `rgba(255,255,255,0.20)` | Hover border emphasis, interactive states |

### 2.4 Semantic Status Colors

| Token | Tailwind Class | Light | Dark | Usage |
|-------|---|-------|------|-------|
| Success | `text-success` | `#059669` | `#10B981` | Confirmations, success messages |
| Warning | `text-warning` | `#D97706` | `#F59E0B` | Cautions, alerts |
| Error | `text-error` | `#DC2626` | `#EF4444` | Error messages, destructive actions |

### 2.5 Track Category Colors

15 track categories, each with a bright color (for dark mode) and a darker text variant (for light mode). Track colors are inline-styled on session cards via the `getTrackColor()` function. Text contrast uses `getTrackTextColor(track, isDark)`.

| Track | Dark (Bright) | Light (Text) | RGB Bright |
|-------|---|---|---|
| Tech & AI | `#3B82F6` | `#2563EB` | Blue-600 |
| Design | `#8B5CF6` | `#7C3AED` | Violet-500 |
| Culture | `#EC4899` | `#DB2777` | Pink-500 |
| Health | `#10B981` | `#059669` | Emerald-500 |
| Creator Economy | `#F59E0B` | `#D97706` | Amber-500 |
| Brand & Marketing | `#EF4444` | `#DC2626` | Red-500 |
| Cities & Climate | `#06B6D4` | `#0891B2` | Cyan-500 |
| Startups | `#FF6B35` | `#CC5528` | Orange-600 (brand) |
| Sports & Gaming | `#84CC16` | `#65A30D` | Lime-500 |
| Music | `#A855F7` | `#7C3AED` | Purple-500 |
| Film & TV | `#F43F5E` | `#E11D48` | Rose-500 |
| Workplace | `#6366F1` | `#4F46E5` | Indigo-500 |
| Global | `#14B8A6` | `#0D9488` | Teal-500 |
| Headliner | `#00D4AA` | `#059669` | Turquoise (accent) |
| Default | `#6B7280` | `#4B5563` | Gray |

**Implementation:** Track colors are defined in `lib/track-colors.ts`. Always use `getTrackColor(track)` to retrieve the bright color, and `getTrackTextColor(track, isDark)` when rendering text that must meet contrast requirements.

### 2.6 Gradients

**Brand Gradient:** Linear from primary through secondary to accent.
```css
linear-gradient(135deg, #FF6B35, #FF8F65, #00D4AA)
```

Used in:
- `.text-gradient` utility — gradient text for hero headings
- Progress bar fill — 500ms ease-out transition as quiz progresses
- Loading spinners — visual emphasis during generation

---

## 3. Typography

All fonts are loaded via CSS variables, allowing future font changes without code refactoring. Font families and sizes are defined in `tailwind.config.ts` and referenced by component classes.

### 3.1 Font Families

| Role | Font | Weights | CSS Variable | Usage |
|------|------|---------|-------------|-------|
| Headings | Space Grotesk | 700 (bold) | `--font-space-grotesk` | H1–H3, labels, display text |
| Body | Inter | 400, 500, 600 | `--font-inter` | Paragraphs, UI text, descriptions |

**Font Loading:** Both fonts are loaded via Vercel's font optimization. Fallback to system fonts if unavailable.

### 3.2 Type Scale

| Token | Tailwind Class | Size | Line Height | Font Weight | Usage |
|-------|---|---|---|---|---|
| Hero | `text-4xl` / `md:text-6xl` / `lg:text-7xl` | 36/60/72px | tight (1.2) | 700 | Landing hero text only |
| H1 | `text-3xl` | 30px | tight | 700 | Page titles, main headings |
| H2 | `text-2xl` | 24px | snug (1.375) | 700 | Section headings, quiz questions |
| H3 | `text-xl` | 20px | snug | 700 | Subheadings, emphasis |
| Body | `text-base` | 16px | relaxed (1.625) | 400 | Paragraphs, long text |
| Body Small | `text-sm` | 14px | relaxed | 400–500 | UI text, descriptions, buttons |
| Label | `text-xs` | 12px | normal (1) | 500–600 | Form labels, metadata |
| Caption | `text-caption` | 11px | 16px | 500 | Track badges, "Top Pick" labels, popovers |
| Micro | `text-micro` | 10px | 14px | 500 | Timeline timestamps, footer, build SHA |

**Line Height Values:** Tailwind defaults (tight=1.2, snug=1.375, normal=1, relaxed=1.625) + custom micro/caption via `tailwind.config.ts`.

### 3.3 Heading Treatment

- **Hero:** Uppercase, font-heading, font-bold, text-gradient background
- **H1–H3:** Title case, font-heading, font-bold, text color (not gradient)
- **Body text:** Sentence case, font-sans, text-base or smaller

---

## 4. Spacing & Layout

### 4.1 Grid & Base Unit

Tailwind's default 4px base unit. All spacing uses Tailwind's scale (1 = 4px, 2 = 8px, 4 = 16px, etc.). Never use arbitrary pixel values like `w-[23px]` — use the nearest Tailwind size.

### 4.2 Content Max-Widths

| Context | Tailwind Class | Width | Usage |
|---------|---|---|---|
| Schedule page | `max-w-4xl` | 896px | Session timeline, list view |
| Quiz / Chat | `max-w-2xl` | 672px | Quiz steps, chat interface |
| Map view | `max-w-7xl` | 1280px | Full-screen map with sidebar |
| Hero text | `max-w-xl` | 576px | Landing page subtitle/description |

### 4.3 Section Padding

| Context | Classes | Desktop | Mobile |
|---------|---------|---------|--------|
| Hero section | `py-20 md:py-28 px-4 md:px-8` | 80px top/bottom, 32px side | 80px top/bottom, 16px side |
| Content sections | `py-8 px-4 md:px-8` | 32px top/bottom, 32px side | 32px top/bottom, 16px side |
| Refine header | `py-6 px-4 md:px-8` | 24px top/bottom, 32px side | 24px top/bottom, 16px side |
| Card content | `p-5` | 20px all sides | 20px all sides |

### 4.4 Gap Scale

| Size | Tailwind Class | Usage |
|------|---|---|
| Tight | `gap-1` | Icon + text inline, small adjacent elements |
| Small | `gap-1.5` | Day tabs, button groups, chip rows |
| Medium | `gap-2` | Form fields, tightly related chips |
| Standard | `gap-3` | Session card rows, related blocks |
| Large | `gap-4` | Between major sections |
| Extra Large | `gap-8` | Session cards in list view, section separation |

---

## 5. Component Catalog

### 5.1 Buttons

#### Primary Button
Use for main CTAs (generate schedule, refine, share).

```
bg-primary text-white rounded-full px-8 py-3 font-semibold text-sm
hover:bg-opacity-90 active:scale-[0.98]
disabled:opacity-30 disabled:cursor-not-allowed
transition-all duration-200
focus-visible:outline-2 outline-offset-2 outline-primary
```

**States:**
- Default: Solid primary background
- Hover: 90% opacity / brightness-110
- Active: Scale down 2%
- Disabled: 30% opacity, cursor not-allowed
- Focus: 2px orange ring with 2px offset

**Touch target:** 44px height (py-3 = 12px + 16px text + 12px padding)

#### Secondary Button
Use for alternate actions (cancel, close, secondary operations).

```
bg-s2 text-text rounded-full px-6 py-2.5 font-semibold text-sm
hover:bg-sh hover:border-bh transition-all duration-200
focus-visible:outline-2 outline-offset-2 outline-primary
```

**States:** Hover to Surface Hover, text color adapts to theme.

#### Ghost Button
Use for tertiary actions or text-only buttons.

```
text-muted border border-b1 rounded-full px-4 py-2.5 text-sm
hover:border-bh hover:text-text transition-all duration-200
focus-visible:outline-2 outline-offset-2 outline-primary
```

**States:** Border emphasizes on hover, text lightens.

#### Icon Button
Used for mobile-only actions (menu toggle, close).

```
w-10 h-10 rounded-full border border-b1 flex items-center justify-center
hover:border-bh hover:text-text transition-all duration-200
focus-visible:outline-2 outline-offset-2 outline-primary
```

**Content:** Centered SVG icon (16px or 20px), text-sm size.

### 5.2 Selection Card (Quiz Steps)

Card-style toggle buttons with keyboard shortcut badge. Used for badge picker, interest chips, vibe select.

**Unselected:**
```
rounded-xl px-4 py-3.5 text-left min-h-[68px]
bg-s1 border border-b1 text-text
hover:bg-s2 hover:border-bh
transition-all duration-200
cursor-pointer
```

**Selected:**
```
bg-primary/15 border-2 border-primary text-primary
shadow-[0_0_16px_rgba(255,107,53,0.2)]
scale-[1.02]
```

**Keyboard shortcut badge (unselected):**
```
w-6 h-6 rounded-md bg-s2 text-muted border border-b1
text-xs font-semibold flex items-center justify-center
absolute top-2 right-2
```

**Keyboard shortcut badge (selected):**
```
w-6 h-6 rounded-md bg-primary text-white
```

**Accessibility:** Each button has `aria-pressed={isSelected}`, `role="button"`, keyboard handler for enter/space.

### 5.3 Selection Chip (Day Picker)

Pill-shaped toggles for day selection in refine view.

**Unselected:**
```
rounded-full px-4 py-2.5 text-sm font-medium
bg-s1 border border-b1 text-text
hover:bg-s2 hover:border-bh
transition-all duration-200
cursor-pointer
```

**Selected:**
```
bg-primary/20 border border-primary text-primary
shadow-[0_0_12px_rgba(255,107,53,0.15)]
```

**Group:** Flex row with `gap-1.5`, horizontal scroll on mobile.

### 5.4 Suggestion Chip (Chat)

Non-toggle, single-tap chips for chat suggestions and quick actions.

```
bg-s1 border border-b1 rounded-full px-4 py-2 text-sm text-muted font-medium
hover:bg-s2 hover:text-text hover:border-bh
transition-all duration-200
cursor-pointer
```

### 5.5 Preference Breadcrumb

Read-only pills showing quiz selections on the schedule page.

**Interest chip:**
```
bg-s1 text-muted px-2.5 py-1 rounded-full text-xs font-medium
```

**Vibe chip:**
```
bg-primary/10 text-primary/80 px-2.5 py-1 rounded-full text-xs font-medium
```

**Badge chip:**
```
bg-accent/10 text-accent-readable px-2.5 py-1 rounded-full text-xs font-medium
```

**Group:** Flex row with `gap-2`, flex-wrap for overflow.

### 5.6 Session Card

Full-width card linking to SXSW session page. Track color as left border accent.

```
border-l-[3px] rounded-xl p-5
bg-s1 backdrop-blur-md border-t border-r border-b border-b1
hover:bg-sh hover:border-b2
transition-all duration-200
cursor-pointer
```

**Left border color:** Set via inline `style={{ borderLeftColor: getTrackColor(track) }}`.

**Top pick variant:**
- Full opacity, no shadow filter
- Star icon + "Top Pick" label in top-right
- Session details visible: time, title, track badge, venue

**Alternative variant:**
- `opacity-60` baseline
- Compact layout, swap icon visible
- On hover: opacity-80, `bg-sh`
- Title truncated to 1–2 lines

**Internal structure:**
```
<div class="flex gap-3">
  <div class="flex-1">
    <div class="text-micro text-muted">HH:MM AM/PM</div>
    <h3 class="text-sm font-semibold line-clamp-2">Title</h3>
    <div class="flex gap-1.5 items-center text-xs mt-2">
      <span class="w-2 h-2 rounded-full" style={{ backgroundColor }}></span>
      <span class="text-muted">Track Name</span>
      <span class="text-muted">•</span>
      <span class="text-muted">Venue</span>
    </div>
  </div>
  <!-- Top Pick badge or Swap button -->
</div>
```

**Accessibility:** `role="link"`, `tabIndex={0}`, `aria-label={title}`, keyboard handler for Enter/Space to follow link or trigger swap.

### 5.7 Timeline Block

Absolutely positioned session block in timeline view. Appears in two sizes depending on overlap context.

**Top Pick (full detail):**
```
border-l-[3px] rounded-r-lg px-3 py-1.5
bg-s1 backdrop-blur-md border-t border-r border-b border-b1
hover:bg-sh transition-all duration-200
```

Content: time (micro), title (text-xs/sm), track dot (w-2 h-2 rounded-full), venue (text-micro muted).

**Alternative (compact):**
```
bg-ss border border-b1 rounded-r-lg px-2 py-1
opacity-50 hover:opacity-80 hover:bg-s1
transition-all duration-200
```

Content: swap icon (w-4 h-4), title (text-xs), track dot, venue omitted.

**Z-stack:** Top picks at `z-10`, alternatives at `z-0`. Click triggers popover.

### 5.8 Session Popover

Positioned dialog appearing on timeline block or session card click.

```
bg-background border border-b1 rounded-xl shadow-2xl p-5
popover-enter animation
position: absolute; top: 100%; left: 0; z-index: 50;
```

**Content sections:**
- Time/venue (text-micro, text-muted)
- Title (text-xl, font-bold)
- Track badge: inline colored pill with `bg-[color]/10` background, colored text
- Description (text-sm, text-text, mt-3)
- Speakers (text-sm, text-muted)
- AI reason: "Why this pick" (text-sm, text-accent-readable, mt-3)
- SXSW link: secondary button at bottom

**Backdrop:** Semi-transparent overlay (`bg-black/40`) behind popover on mobile.

**Accessibility:** `role="dialog"`, `aria-label`, `aria-modal="true"`, focus trap (first element receives focus), Escape closes, click-outside closes, return focus to trigger.

### 5.9 Message Bubble (Chat)

**User message:**
```
bg-primary text-white rounded-[20px] rounded-br-[2px] px-4 py-3 text-sm
self-end max-w-[80%]
```

**Assistant message:**
```
bg-s1 border border-b1 text-text rounded-[20px] rounded-bl-[2px] px-4 py-3 text-sm
self-start max-w-[80%]
```

**Group:** Flex column with `gap-2` between messages, `gap-4` between message groups.

### 5.10 Typing Indicator

Three bouncing dots inside assistant-style bubble.

```
bg-s1 border border-b1 rounded-[20px] rounded-bl-[2px] px-4 py-3
flex gap-1 items-center
```

**Dots:**
```
w-1.5 h-1.5 rounded-full bg-muted typing-dot
```

CSS animation (`typingBounce`) with staggered delays (0s, 0.2s, 0.4s). Bounces up 4px at peak, opacity 0.3 → 1 → 0.3.

### 5.11 Text Input

Used for quiz name, chat input, preferences.

```
w-full px-4 py-3 rounded-xl text-sm
bg-s1 border border-b1 text-text placeholder:text-muted
focus:border-primary/50 focus:ring-1 focus:ring-primary/25 focus:outline-none
transition-colors duration-200
```

**States:**
- Default: Surface 1 + Border 1
- Focus: Border shifts to primary/50 with 1px ring (primary/25)
- Disabled: `opacity-50 cursor-not-allowed`
- Error: `border-error focus:ring-error/25`

**Placeholder:** Muted color, medium weight.

### 5.12 Textarea

Identical to text input with `resize-none` and `rows={4}`.

```
w-full px-4 py-3 rounded-xl text-sm
bg-s1 border border-b1 text-text placeholder:text-muted
focus:border-primary/50 focus:ring-1 focus:ring-primary/25 focus:outline-none
transition-colors duration-200
resize-none
```

### 5.13 Progress Bar

Shows quiz progress as user advances through steps.

**Container:**
```
h-1 bg-s1 rounded-full overflow-hidden
```

**Fill:**
```
bg-gradient-to-r from-primary to-accent rounded-full
transition-all duration-500 ease-out
height: 100%
```

**Accessibility:** `role="progressbar"`, `aria-valuenow={currentStep}`, `aria-valuemin="0"`, `aria-valuemax={totalSteps}`, `aria-label="Quiz progress"`.

### 5.14 Day Tabs

Horizontal tabs for day selection in refine view. Scroll-friendly on mobile.

**Tab list:** `flex gap-1.5 overflow-x-auto pb-2`, `role="tablist"`.

**Active tab:**
```
bg-primary text-white rounded-full px-4 py-2.5 text-sm font-medium
shadow-[0_0_16px_rgba(255,107,53,0.2)]
flex-shrink-0
```

**Inactive tab:**
```
bg-s1 text-muted rounded-full px-4 py-2.5 text-sm font-medium
hover:bg-s2 hover:text-text
transition-all duration-200
flex-shrink-0
```

**Accessibility:** `role="tab"`, `aria-selected={isActive}`, `aria-controls="day-panel-{day}"`. Tab panel: `role="tabpanel"`, `id="day-panel-{day}"`, `aria-labelledby="tab-{day}"`.

### 5.15 View Toggle (Segmented Control)

Switch between list, timeline, and map views.

**Container:**
```
rounded-full bg-s1 border border-b1 p-1
flex gap-0.5 inline-flex
```

**Active segment:**
```
bg-primary/20 text-primary rounded-full px-3.5 py-1.5 text-sm font-semibold
```

**Inactive segment:**
```
text-muted rounded-full px-3.5 py-1.5 text-sm font-medium
hover:text-text transition-all duration-200
```

**Accessibility:** `role="group"`, `aria-label="View mode"`. Each button: `role="radio"`, `aria-pressed={isActive}`, `aria-label="List view"` etc.

### 5.16 Share Dialog

Opens as popover or bottom sheet depending on viewport.

**Mobile (fixed bottom sheet):**
```
position: fixed; bottom: 16px; left: 16px; right: 16px;
bg-background border border-b1 rounded-xl shadow-2xl p-4
popover-enter animation
```

**Desktop (dropdown popover):**
```
position: absolute; top: 100%; right: 0;
bg-background border border-b1 rounded-xl shadow-2xl p-4
min-w-[240px]
popover-enter animation
```

**Backdrop:** `bg-black/40 fixed inset-0` on mobile, none on desktop.

**Action items:**
```
flex items-center gap-3 px-3 py-2.5 rounded-lg
hover:bg-s1 transition-all duration-200
cursor-pointer text-sm
```

Icon container: 32px circle with icon centered.

**Accessibility:** `role="dialog"`, `aria-label="Share schedule"`, `aria-modal="true"`, focus trap, Escape closes, click-outside closes.

### 5.17 Loading Spinner

Used during schedule generation and chat processing.

**Container:**
```
relative w-16 h-16 flex items-center justify-center
```

**Outer ring (static background):**
```
absolute border-2 border-primary/20 rounded-full w-16 h-16
```

**Spinning ring (animated):**
```
absolute border-2 border-primary border-t-transparent rounded-full w-16 h-16
animate-spin
```

**Pulse ring:**
```
absolute border border-primary/10 rounded-full w-16 h-16
pulse-ring animation (scale 0.8 → 1.2 + fade)
```

**Label:** Optional text below (text-sm, text-muted) — "Generating your schedule..."

### 5.18 Skeleton

Placeholder component for loading states. Adapts to content shape.

```
rounded bg-gradient-to-r from-transparent via-skeleton-bg to-transparent
skeleton-pulse animation (opacity 0.05 → 0.12)
```

Used for:
- Session card skeletons (height: 120px, width: 100%)
- Text line skeletons (height: 16px, width: varies)
- Avatar skeletons (width: 32px, height: 32px, rounded-full)

### 5.19 Glass Card

Translucent card component with subtle blur and adaptive colors.

```css
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass:hover {
  background: var(--surface-hover);
}
```

Used for:
- Hero section background cards
- Alternative session blocks
- Chat message backgrounds

### 5.20 Theme Toggle

Fixed-position button to switch between light and dark modes.

```
fixed top-4 right-4 z-50
p-2 rounded-full bg-s1 border border-b1
hover:bg-sh transition-colors duration-200
focus-visible:outline-2 outline-offset-2 outline-primary
```

**Icon:** SVG sun (dark mode active) or moon (light mode active), 16px or 20px.

**Accessibility:** `aria-label="Toggle dark mode"` / `"Toggle light mode"`, `role="button"`, keyboard handler for Enter/Space.

---

## 6. Animation & Motion

All animations defined in `globals.css` with @keyframe definitions and animation utilities.

| Name | Class | Duration | Easing | Description |
|------|-------|----------|--------|-------------|
| **Quiz slide right** | `.quiz-step-enter` | 300ms | ease | Slide in from right (40px) + fade for forward steps |
| **Quiz slide left** | `.quiz-step-enter-back` | 300ms | ease | Slide in from left (40px) + fade for back steps |
| **Loading message** | `.loading-message-enter` | 500ms | ease | Fade in + slide up 4px |
| **Typing dots** | `.typing-dot` | 1.4s | ease-in-out | Bounce up 4px, staggered (0s, 0.2s, 0.4s) |
| **Toast slide in** | `.toast-enter` | 300ms | ease | Slide up 16px + fade |
| **Toast slide out** | `.toast-exit` | 300ms | ease | Slide down 16px + fade |
| **Skeleton pulse** | `.skeleton-pulse` | 1.5s | ease-in-out | Opacity 0.05 ↔ 0.12 infinite |
| **Spinner pulse** | `.pulse-ring` | 2s | ease-out | Scale 0.8 → 1.2, opacity 0.6 → 0 |
| **Popover enter** | `.popover-enter` | 150ms | ease-out | Scale 0.98 → 1, fade, slide up 4px |
| **Hover transitions** | `transition-all` | 200ms | default | Buttons, cards, borders |

**Reduced Motion:** `@media (prefers-reduced-motion: reduce)` sets all animations to 0.01ms duration and 1 iteration. Scroll behavior set to `auto`.

---

## 7. Design Tokens (JSON)

Complete token set organized by category. Use this as a reference for design specs and future tool integrations.

```json
{
  "color": {
    "background": {
      "light": "#FAFAFA",
      "dark": "#0A0A0A"
    },
    "text": {
      "light": "#1A1A1A",
      "dark": "#F5F5F5"
    },
    "muted": {
      "light": "#6B7280",
      "dark": "#9CA3AF"
    },
    "primary": "#FF6B35",
    "accent": "#00D4AA",
    "accentReadable": {
      "light": "#059669",
      "dark": "#00D4AA"
    },
    "surface": {
      "1": {
        "light": "rgba(0,0,0,0.04)",
        "dark": "rgba(255,255,255,0.05)"
      },
      "2": {
        "light": "rgba(0,0,0,0.06)",
        "dark": "rgba(255,255,255,0.10)"
      },
      "hover": {
        "light": "rgba(0,0,0,0.08)",
        "dark": "rgba(255,255,255,0.08)"
      },
      "active": {
        "light": "rgba(0,0,0,0.12)",
        "dark": "rgba(255,255,255,0.15)"
      },
      "subtle": {
        "light": "rgba(0,0,0,0.02)",
        "dark": "rgba(255,255,255,0.03)"
      }
    },
    "border": {
      "1": {
        "light": "rgba(0,0,0,0.08)",
        "dark": "rgba(255,255,255,0.10)"
      },
      "2": {
        "light": "rgba(0,0,0,0.12)",
        "dark": "rgba(255,255,255,0.15)"
      },
      "hover": {
        "light": "rgba(0,0,0,0.15)",
        "dark": "rgba(255,255,255,0.20)"
      }
    },
    "semantic": {
      "success": {
        "light": "#059669",
        "dark": "#10B981"
      },
      "warning": {
        "light": "#D97706",
        "dark": "#F59E0B"
      },
      "error": {
        "light": "#DC2626",
        "dark": "#EF4444"
      }
    },
    "track": {
      "techAi": {
        "bright": "#3B82F6",
        "text": "#2563EB"
      },
      "design": {
        "bright": "#8B5CF6",
        "text": "#7C3AED"
      },
      "culture": {
        "bright": "#EC4899",
        "text": "#DB2777"
      },
      "health": {
        "bright": "#10B981",
        "text": "#059669"
      },
      "creatorEconomy": {
        "bright": "#F59E0B",
        "text": "#D97706"
      },
      "brandMarketing": {
        "bright": "#EF4444",
        "text": "#DC2626"
      },
      "citiesClimate": {
        "bright": "#06B6D4",
        "text": "#0891B2"
      },
      "startups": {
        "bright": "#FF6B35",
        "text": "#CC5528"
      },
      "sportsGaming": {
        "bright": "#84CC16",
        "text": "#65A30D"
      },
      "music": {
        "bright": "#A855F7",
        "text": "#7C3AED"
      },
      "filmTv": {
        "bright": "#F43F5E",
        "text": "#E11D48"
      },
      "workplace": {
        "bright": "#6366F1",
        "text": "#4F46E5"
      },
      "global": {
        "bright": "#14B8A6",
        "text": "#0D9488"
      },
      "headliner": {
        "bright": "#00D4AA",
        "text": "#059669"
      },
      "default": {
        "bright": "#6B7280",
        "text": "#4B5563"
      }
    },
    "gradient": {
      "brand": "linear-gradient(135deg, #FF6B35, #FF8F65, #00D4AA)"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Space Grotesk",
      "body": "Inter"
    },
    "scale": {
      "hero": {
        "responsive": "36px / 60px / 72px",
        "lineHeight": "tight",
        "weight": 700
      },
      "h1": {
        "size": "30px",
        "lineHeight": "tight",
        "weight": 700
      },
      "h2": {
        "size": "24px",
        "lineHeight": "snug",
        "weight": 700
      },
      "h3": {
        "size": "20px",
        "lineHeight": "snug",
        "weight": 700
      },
      "body": {
        "size": "16px",
        "lineHeight": "relaxed",
        "weight": 400
      },
      "bodySm": {
        "size": "14px",
        "lineHeight": "relaxed",
        "weight": "400–500"
      },
      "label": {
        "size": "12px",
        "lineHeight": "normal",
        "weight": "500–600"
      },
      "caption": {
        "size": "11px",
        "lineHeight": "16px",
        "weight": 500
      },
      "micro": {
        "size": "10px",
        "lineHeight": "14px",
        "weight": 500
      }
    }
  },
  "spacing": {
    "baseUnit": "4px",
    "sectionPadding": {
      "hero": {
        "mobile": "py-20 px-4",
        "desktop": "py-28 px-8"
      },
      "content": {
        "mobile": "py-8 px-4",
        "desktop": "py-8 px-8"
      }
    },
    "cardPadding": "p-5",
    "maxWidth": {
      "schedule": "896px",
      "quiz": "672px",
      "map": "1280px",
      "hero": "576px"
    }
  },
  "radius": {
    "full": "9999px",
    "xl": "12px",
    "lg": "8px",
    "md": "6px"
  },
  "shadow": {
    "glass": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "popover": "0 20px 25px rgba(0, 0, 0, 0.15)",
    "card": "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  "animation": {
    "hover": "200ms ease",
    "pageTransition": "300ms ease",
    "microInteraction": "150ms ease-out",
    "loading": "500ms ease",
    "skeleton": "1.5s ease-in-out infinite"
  },
  "breakpoint": {
    "mobile": "0px",
    "tablet": "768px",
    "desktop": "1024px"
  }
}
```

---

## 8. Do's and Don'ts

### Do

- **Use semantic surface tokens** — `bg-s1`, `bg-s2`, `bg-sh`, `bg-sa`, `bg-ss`. They adapt to light/dark mode automatically via CSS variables.
- **Use semantic border tokens** — `border-b1`, `border-b2`, `border-bh`. Never raw `border-white/10` or `border-black/8`.
- **Use `text-accent-readable`** for text links, AI commentary, and any text that requires WCAG AA contrast. Don't use `text-accent` (too bright on light backgrounds).
- **Use `text-error`, `text-warning`, `text-success`** for semantic states. Never raw `text-red-400`.
- **Set `aria-pressed` on toggle buttons** (selection chips, day tabs, view toggle).
- **Set `role="dialog"` and `aria-label`** on popovers, modals, and bottom sheets.
- **Ensure 44px minimum height/width** on all touch targets (buttons, inputs, interactive areas).
- **Test both light and dark mode** before shipping. Use DevTools to toggle `color-scheme` or browser dark mode.
- **Add `prefers-reduced-motion` consideration** — test with animation disabled in DevTools.
- **Use the brand gradient** (`linear-gradient(135deg, #FF6B35, #FF8F65, #00D4AA)`) for emphasis, not repeated everywhere.
- **Use Tailwind classes**, not inline styles, except for dynamic color values (track colors, conditional classes).
- **Use semantic HTML** — `<button>`, `<a>`, `<dialog>`, `<input>` — don't repurpose `<div>` as interactive elements.

### Don't

- **Don't use `bg-white/5` or `border-white/10`** — these don't adapt to light mode. Use semantic tokens instead.
- **Don't use `dark:` prefix** for surface, border, or semantic colors. The CSS custom properties handle both modes automatically.
- **Don't nest `<button>` inside `<button>` or `<button>` inside `<a>`** — breaks semantics and accessibility.
- **Don't use pixel font sizes** like `text-[11px]`. Use named size tokens (`text-caption`, `text-micro`). If a size doesn't exist, add it to `tailwind.config.ts`.
- **Don't use `#6B7280` directly** — use `text-muted`. The dark mode value was updated to `#9CA3AF` for improved contrast, and using the token ensures consistency.
- **Don't add `:root:not(.dark)` overrides** — add a CSS variable to `globals.css` instead.
- **Don't use `!important`** for theme adaptation. If a color isn't adapting, check the CSS variable definition, not the specificity.
- **Don't hardcode brand colors** in component inline styles. Use Tailwind classes or CSS variables.
- **Don't skip focus states** — every interactive element needs `:focus-visible` styling. Use the orange ring (`outline-2 outline-offset-2 outline-primary`).
- **Don't override Tailwind animations** with custom `animation-duration` — use the motion tokens (200ms, 300ms, 500ms).
- **Don't use absolute positioning** for layouts that could flex. Reserve `position: absolute` for popovers, tooltips, and overlays.

---

## 9. Developer Guide

### Adding a New Color Token

1. Define the color in `:root` and `.dark` blocks in `/app/globals.css`:
   ```css
   :root {
     --my-color: #AABBCC;
   }
   .dark {
     --my-color: #DDEEFF;
   }
   ```

2. Map the token in `/tailwind.config.ts`:
   ```ts
   colors: {
     myColor: 'var(--my-color)',
   }
   ```

3. Use in components:
   ```tsx
   <div className="bg-myColor text-myColor">...</div>
   ```

4. Document the token in this file's Color System section.

### Adding a New Track Category

1. Add to `TRACK_COLORS` in `/lib/track-colors.ts`:
   ```ts
   'New Track Name': '#BRIGHT_HEX'
   ```

2. Add light-mode text variant to `TRACK_TEXT_COLORS_LIGHT`:
   ```ts
   'New Track Name': '#TEXT_HEX'
   ```

3. Verify contrast at https://webaim.org/resources/contrastchecker/.

4. Update the track color table in this file's Color System section.

### Adding a New Component

1. Create file in appropriate `components/` subdirectory (e.g., `components/ui/`, `components/quiz/`, `components/schedule/`).

2. Use semantic tokens exclusively:
   - Backgrounds: `bg-s1`, `bg-s2`, `bg-sh`, `bg-sa`, `bg-ss`
   - Borders: `border-b1`, `border-b2`, `border-bh`
   - Text: `text-text`, `text-muted`, `text-primary`, `text-error`, etc.

3. Add full keyboard and screen reader support:
   - `role=` attribute if not native HTML element
   - `aria-label=` for unlabeled elements
   - `aria-pressed=` for toggles
   - `aria-modal=` for dialogs
   - `tabIndex=` for custom interactive elements
   - Keyboard handler for Enter/Space (buttons, toggles)

4. Test in both light and dark mode:
   - Use browser dark mode toggle
   - Check contrast in DevTools Accessibility tab

5. Document the component in this file's Component Catalog section with:
   - CSS classes and structure
   - Variants (default, hover, active, disabled, focus)
   - Accessibility attributes
   - Touch target sizes

### Light/Dark Mode Architecture

**How it works:**
1. CSS custom properties are defined in `:root` (light mode) and `.dark` (dark mode) in `globals.css`.
2. Tailwind classes in `tailwind.config.ts` reference these properties via `var()`.
3. The theme is toggled via the `dark` class on the `<html>` element.
4. A blocking `<script>` in `<head>` prevents flash by applying the saved theme before the page renders.

**To change the theme programmatically:**
```ts
// Apply dark mode
document.documentElement.classList.add('dark')
localStorage.setItem('theme', 'dark')

// Apply light mode
document.documentElement.classList.remove('dark')
localStorage.setItem('theme', 'light')

// Follow system preference
localStorage.removeItem('theme')
```

**Important:** Never use `dark:` prefix for theme-dependent colors. Always use CSS variables.

### Contrast Checking

Use https://webaim.org/resources/contrastchecker/ to verify all text has adequate contrast:

- **Body text, labels:** Minimum WCAG AA (4.5:1 for small text, 3:1 for large text ≥18px bold)
- **Muted text:** Light `#6B7280` on `#FAFAFA` = 5.9:1 ✓ | Dark `#9CA3AF` on `#0A0A0A` = 6.3:1 ✓
- **Primary (`#FF6B35`)** on dark background = 3.5:1 — acceptable for large/bold text only, not body
- **Track colors** have text variants (`TRACK_TEXT_COLORS_LIGHT`) for light mode contrast
- **Accent (`#00D4AA`)** has a readable variant (`#059669` light, `#00D4AA` dark) for text

### Performance Considerations

- **Animations:** All animations respect `prefers-reduced-motion`. Test with reduced motion enabled.
- **Backdrop filter:** Used sparingly (cards, glass effect). Can impact performance on older devices.
- **Transitions:** 200ms for hover states, 300–500ms for page transitions. Keep snappy.
- **Font loading:** Both Space Grotesk and Inter are loaded via Vercel optimization. No custom font loading needed.

---

## 10. Related Files

- **Tailwind Config:** `/tailwind.config.ts` — Color mapping, font families, custom utilities
- **Global Styles:** `/app/globals.css` — CSS variables, animations, base styles
- **Track Colors:** `/lib/track-colors.ts` — Track color definitions and helper functions
- **Implementation Plan:** `/docs/plans/2026-03-05-implementation-plan.md` — Feature roadmap and technical specs
- **Copy Guide:** `/docs/copy.md` — Messaging, tone, and content guidelines
- **Brand Guide:** `/docs/brand.md` — Logo, brand values, positioning

---

## 11. Version History

- **2026-03-09** — Initial design system documentation. Covers South by AI v1 (quiz, schedule generation, refine chat, map view).

---

**Last updated:** March 9, 2026
