# Next Pass Status & Inventory

## How to Run

```bash
cd golf-ryder-cup-web
npm install
npm run dev     # Dev server at localhost:3000
npm run build   # Production build
npm test        # Run vitest tests
```

## Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.x
- **Styling**: Tailwind CSS 4 with CSS custom properties
- **State**: Zustand stores + Dexie (IndexedDB)
- **Icons**: lucide-react

## Key Screen Locations

| Screen | File |
|--------|------|
| Home | `src/app/page.tsx` |
| Standings | `src/app/standings/page.tsx` |
| Score List | `src/app/score/page.tsx` |
| Match Scoring | `src/app/score/[matchId]/page.tsx` |
| Players | `src/app/players/page.tsx` |
| Matchups | `src/app/matchups/page.tsx` |
| Courses | `src/app/courses/page.tsx` |
| More/Settings | `src/app/more/page.tsx` |

## Layout & Shell

| Component | File |
|-----------|------|
| App Shell | `src/components/layout/AppShellNew.tsx` |
| Header | `src/components/layout/HeaderNew.tsx` |
| Bottom Nav | `src/components/layout/BottomNavNew.tsx` |
| Sidebar | `src/components/layout/SidebarNav.tsx` |

## Core UI Primitives

| Component | File | Notes |
|-----------|------|-------|
| Card | `src/components/ui/Card.tsx` | Heavy box framing, needs removal |
| Badge | `src/components/ui/Badge.tsx` | Status badges |
| Button | `src/components/ui/Button.tsx` | Action buttons |
| Modal | `src/components/ui/Modal.tsx` | Dialog overlays |
| Toast | `src/components/ui/Toast.tsx` | Notifications |

## Design Tokens

Located in `src/app/globals.css`:
- Dark theme with `--surface-base: #1A1918`
- Text hierarchy via CSS custom properties
- Masters green `#006747` as accent

## Current Problems (High Level)

1. **Dark dashboard aesthetic**: The dark `#1A1918` background with card stacking reads as SaaS, not editorial
2. **Box-first structure**: Card component used everywhere creates visual clutter
3. **Typography is weak**: No clear 4-role type system; bold overused
4. **Home is a list**: No editorial "lead" with state + context
5. **Scores lack ceremony**: Numbers don't feel monumental
6. **AppShellNew is heavy**: Multiple wrappers, chrome competes with content

## Constraints

- Must preserve all business logic (scoring, state, routing)
- No new dependencies
- Keep tests passing
- Mobile-first but desktop responsive

## Verification After Changes

```bash
npm run build   # Must compile
npm test        # Must pass (49 tests)
```
