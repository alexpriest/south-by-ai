# South by AI -- Brand Guide

## Color System

| Token       | Value                      | Usage                                    |
|-------------|----------------------------|------------------------------------------|
| Background  | `#0A0A0A`                  | Page background, near-black              |
| Primary     | `#FF6B35`                  | CTAs, selected states, brand elements    |
| Accent      | `#00D4AA`                  | Secondary actions, highlights, links     |
| Text        | `#F5F5F5`                  | Primary text                             |
| Muted       | `#6B7280`                  | Secondary text, timestamps, placeholders |
| Surface     | `rgba(255, 255, 255, 0.05)`| Card backgrounds                         |
| Border      | `rgba(255, 255, 255, 0.1)` | Card/section borders                     |

### Tailwind Mapping

```js
// tailwind.config.ts
colors: {
  background: '#0A0A0A',
  primary: '#FF6B35',
  accent: '#00D4AA',
  text: '#F5F5F5',
  muted: '#6B7280',
}
```

## Typography

### Font Families

| Role     | Font           | Weights              |
|----------|----------------|----------------------|
| Headings | Space Grotesk  | 700 (bold)           |
| Body     | Inter          | 400, 500, 600        |

### Heading Treatment

- Hero: all caps
- All other headings: title case

### Size Scale

| Token   | Tailwind   | Usage                  |
|---------|------------|------------------------|
| Hero    | `text-4xl md:text-6xl` | Landing hero     |
| H1      | `text-3xl` | Page titles            |
| H2      | `text-2xl` | Section headings       |
| H3      | `text-xl`  | Card titles, subheads  |
| Body    | `text-base`| Paragraphs, UI text    |
| Small   | `text-sm`  | Labels, metadata       |
| Caption | `text-xs`  | Timestamps, fine print |

## Component Styles

### Cards

```
bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6
```

### Buttons

**Primary** (main CTAs):
```
bg-primary text-white rounded-full px-8 py-3 font-semibold hover:bg-primary/90 transition-colors
```

**Secondary** (supporting actions):
```
bg-white/10 text-white rounded-full px-6 py-2.5 hover:bg-white/20 transition-colors
```

### Chips / Tags

**Unselected**:
```
bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm
```

**Selected**:
```
bg-primary/20 border border-primary rounded-full px-4 py-2 text-sm text-primary
```

### Input Fields

```
bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/25
```

## Spacing

- Base grid: 4px
- Section padding: `py-16 px-4 md:px-8`
- Content max width: `max-w-4xl mx-auto`
- Quiz/chat max width: `max-w-2xl mx-auto`

## Animation

| Type              | Duration | Easing |
|-------------------|----------|--------|
| Hover states      | 200ms    | ease   |
| Page transitions  | 300ms    | ease   |
| Micro-interactions| 150ms    | ease   |

## Layout

- All content centered with `mx-auto`
- Primary content: `max-w-4xl`
- Focused content (quiz, chat): `max-w-2xl`
- Mobile-first responsive design
- Minimum touch target: 44px
