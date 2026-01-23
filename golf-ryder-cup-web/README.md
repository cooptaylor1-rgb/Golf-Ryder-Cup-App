# 🏆 Golf Ryder Cup Web App

A premium Progressive Web App for tracking Ryder Cup–style golf tournaments.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + inline styles for critical colors
- **State**: Zustand (client state) + Dexie.js (IndexedDB persistence)
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design System

**Masters / Augusta National inspired premium dark theme:**

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0F0D0A` | Rich warm black |
| Surface | `#1E1C18` | Card backgrounds |
| Gold Accent | `#C4A747` | Primary accent (buttons, active states) |
| Magnolia | `#F5F1E8` | Primary text color |
| Border | `#3A3530` | Subtle borders |

### Typography

- **Display**: Georgia serif for headers and titles
- **Body**: Inter / system fonts
- **Scores**: Monospace with tabular nums

## Project Structure

```
src/
├── app/              # Next.js routes
│   ├── page.tsx      # Home (trip list)
│   ├── score/        # Live scoring
│   ├── matchups/     # Session management
│   ├── standings/    # Leaderboard
│   └── trip/         # Trip creation/settings
├── components/       # Reusable UI
│   ├── layout/       # AppShell, Nav, Header
│   └── ui/           # Buttons, Cards, etc.
└── lib/
    ├── db/           # IndexedDB (Dexie)
    ├── services/     # Business logic
    ├── stores/       # Zustand stores
    └── types/        # TypeScript types
```

## Styling Notes

⚠️ **Important**: Tailwind CSS 4 arbitrary color values (`bg-[#hex]`) may not render reliably. Critical colors use inline React `style={{}}` attributes for guaranteed rendering.

Example:

```tsx
// Preferred for critical colors:
<div style={{ background: '#0F0D0A', color: '#F5F1E8' }}>

// Tailwind for layout/spacing:
<div className="min-h-screen flex flex-col px-4">
```

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # TypeScript check
npm test          # Unit tests (Vitest)
npm run test:e2e  # E2E tests (Playwright)
npm run analyze   # Bundle analysis
```
