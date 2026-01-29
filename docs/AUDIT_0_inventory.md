# AUDIT 0 — Inventory

## Stack & Versions (from package/config)

- **Frontend framework:** Next.js 16.1.1 (App Router) — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **UI runtime:** React 19.2.3, React DOM 19.2.3 — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Language:** TypeScript 5 — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Styling:** Tailwind CSS 4, PostCSS — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json), [golf-ryder-cup-web/postcss.config.mjs](../golf-ryder-cup-web/postcss.config.mjs)
- **State management:** Zustand 5 — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Forms/validation:** React Hook Form + Zod — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Offline/local DB:** Dexie + IndexedDB — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json), [golf-ryder-cup-web/src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts)
- **Backend/data:** Supabase Postgres + Realtime — [golf-ryder-cup-web/src/lib/supabase/client.ts](../golf-ryder-cup-web/src/lib/supabase/client.ts), [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql)
- **PWA/offline:** Custom service worker + offline.html — [golf-ryder-cup-web/public/sw.js](../golf-ryder-cup-web/public/sw.js), [golf-ryder-cup-web/public/offline.html](../golf-ryder-cup-web/public/offline.html)
- **Error monitoring:** Sentry (conditional) — [golf-ryder-cup-web/next.config.ts](../golf-ryder-cup-web/next.config.ts)
- **Mobile packaging:** Capacitor (iOS/Android) — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Testing:** Vitest + Testing Library + Playwright — [golf-ryder-cup-web/package.json](../golf-ryder-cup-web/package.json)
- **Hosting/infra:** Railway/Nixpacks config present — [railway.toml](../railway.toml), [nixpacks.toml](../nixpacks.toml)

## Architecture Map (high level)

- **App shell & routing:** Next.js App Router under [golf-ryder-cup-web/src/app](../golf-ryder-cup-web/src/app)
- **UI components:** [golf-ryder-cup-web/src/components](../golf-ryder-cup-web/src/components)
- **Domain models/types:** [golf-ryder-cup-web/src/lib/types](../golf-ryder-cup-web/src/lib/types)
- **Core scoring engine:** [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)
- **Tournament/standings logic:** [golf-ryder-cup-web/src/lib/services/tournamentEngine.ts](../golf-ryder-cup-web/src/lib/services/tournamentEngine.ts)
- **Handicap/format logic:** [golf-ryder-cup-web/src/lib/services/handicapCalculator.ts](../golf-ryder-cup-web/src/lib/services/handicapCalculator.ts), [golf-ryder-cup-web/src/lib/types/matchFormats.ts](../golf-ryder-cup-web/src/lib/types/matchFormats.ts)
- **Local persistence (offline-first):** Dexie schema in [golf-ryder-cup-web/src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts)
- **Sync & realtime:**
  - Background sync: [golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts](../golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts)
  - Trip sync: [golf-ryder-cup-web/src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts)
  - Live updates (Postgres changes): [golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts](../golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts)
  - Realtime channels (broadcast/presence): [golf-ryder-cup-web/src/lib/services/realtimeSyncService.ts](../golf-ryder-cup-web/src/lib/services/realtimeSyncService.ts)
- **API boundary (server routes):** [golf-ryder-cup-web/src/app/api](../golf-ryder-cup-web/src/app/api)
- **Security/rate limiting middleware:** [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts)

## Critical Paths (what must never fail mid-trip)

1. **Trip access/entry** (share code or auth): trip lookup, membership, data load
2. **Tournament creation** (sessions/matches setup)
3. **Match setup** (pairings, tees/handicaps, format)
4. **Score entry** (per hole, per match) + undo
5. **Standings/leaderboards** (team points, match status)
6. **Live updates / multi-device sync** (near-real-time)
7. **Offline mode & recovery** (no signal, reconnect, conflict handling)
8. **Export/share results** (reports/screenshots)

## Known Unknowns (to inspect next)

- Actual **auth UX** (sign-in vs share code flow) and where it gates reads/writes
- **Conflict resolution** rules for simultaneous edits across devices
- **Score entry UX** for foursomes/fourball and how player-level strokes are stored
- **Session locking & captain overrides** implementation details
- **Analytics/telemetry** coverage for critical actions (score entry, undo, sync fail)
- **CI/CD pipeline** and deployment safeguards
