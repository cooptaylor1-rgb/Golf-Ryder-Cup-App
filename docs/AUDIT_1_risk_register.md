# AUDIT 1 — Risk Register (Top 20)

Severity rubric: **P0** = could break trip / security breach / data loss, **P1** = significant user pain or wrong leaderboard, **P2** = polish/tech debt.

## Stop‑Ship (P0)

1. **P0 · D (Security & Privacy)** — RLS policies allow full public CRUD on core tables.
   - **Evidence:** [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql) — `CREATE POLICY "trips_select_all" ... USING (true)` and similarly for `teams`, `matches`, `hole_results`, etc.
   - **Impact:** Any client with anon key can read/write all trips, matches, and scores.
   - **Recommendation:** Replace `USING (true)` policies with share‑code or auth-based predicates; remove write access from anon clients.
   - **Effort:** M

2. **P0 · D (Security & Privacy)** — Trip access check allows access when a trip has a share code, even without presenting it.
   - **Evidence:** [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts) — `verifyTripAccess()` final block: _“Allow access if trip exists and is public (has share_code)”_.
   - **Impact:** Any requester with a trip UUID can access protected endpoints without a share code.
   - **Recommendation:** Require share code header **or** authenticated membership; do not auto‑grant based on presence of `share_code`.
   - **Effort:** S

## Top 20 Issues

3. **P1 · C (Offline/Connectivity)** — Background sync payload does not match API schema.
   - **Evidence:** [golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts](../golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts) `syncMatchEvents()` sends `events: [{ id, type, payload, timestamp }]` while [golf-ryder-cup-web/src/lib/validations/api.ts](../golf-ryder-cup-web/src/lib/validations/api.ts) expects `events[].data` and optional `holeNumber`.
   - **Impact:** Offline scores may never sync (validation error), leading to missing or lost results.
   - **Recommendation:** Align payload shape and add contract tests for `/api/sync/scores`.
   - **Effort:** S

4. **P1 · C (Offline/Connectivity)** — `useOfflineQueue` is a stub with random success; not a real sync engine.
   - **Evidence:** [golf-ryder-cup-web/src/lib/hooks/useOfflineQueue.ts](../golf-ryder-cup-web/src/lib/hooks/useOfflineQueue.ts) — `syncAction()` uses `Math.random()` and no real API call.
   - **Impact:** Queue may “succeed” locally without persisting to server; inconsistent state across devices.
   - **Recommendation:** Replace with Dexie‑backed queue + actual API calls (or remove if unused).
   - **Effort:** M

5. **P1 · A (Correctness & Domain Logic)** — Undo chooses the oldest scoring event, not the most recent.
   - **Evidence:** [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts) `undoLastScore()` uses `reverse().sortBy('timestamp')` which returns ascending order.
   - **Impact:** Undo can roll back the wrong hole, corrupting match history.
   - **Recommendation:** Use indexed ordering + `last()` or sort descending correctly.
   - **Effort:** S

6. **P1 · A (Correctness & Domain Logic)** — Multiple independent match‑scoring implementations can diverge.
   - **Evidence:** `calculateMatchState()` in [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts), `calculateMatchStatus()` in [golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts](../golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts), and `calculateMatchScore()` in [golf-ryder-cup-web/src/lib/services/spectatorService.ts](../golf-ryder-cup-web/src/lib/services/spectatorService.ts).
   - **Impact:** Inconsistent leaderboards vs match page vs spectator view.
   - **Recommendation:** Centralize on `scoringEngine` or export shared helpers.
   - **Effort:** M

7. **P1 · A (Correctness & Domain Logic)** — Fourball score entry drops per‑player scores.
   - **Evidence:** [golf-ryder-cup-web/src/app/score/[matchId]/page.tsx](../golf-ryder-cup-web/src/app/score/%5BmatchId%5D/page.tsx) — `handleFourballScore()` TODO: “Store individual player scores… For now, just record best ball scores.”
   - **Impact:** No audit trail or re‑calc; incorrect stats/exports for fourball.
   - **Recommendation:** Persist per‑player strokes in `hole_results` (arrays) and update UI + types.
   - **Effort:** M

8. **P1 · B (Data Integrity & Concurrency)** — Trip sync queue is in‑memory only (lost on reload/offline crash).
   - **Evidence:** [golf-ryder-cup-web/src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts) — `const syncQueue: SyncQueueItem[] = [];` with no persistence.
   - **Impact:** Offline changes can be dropped silently on refresh.
   - **Recommendation:** Persist queue to Dexie and hydrate on startup.
   - **Effort:** M

9. **P1 · C (Offline/Connectivity)** — Live updates subscribe to `hole_results` without trip filter.
   - **Evidence:** [golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts](../golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts) — `on('postgres_changes', { table: 'hole_results' })` lacks `trip_id` filter.
   - **Impact:** Cross‑trip data leakage + excessive updates.
   - **Recommendation:** Scope to match IDs for the trip or filter by session/trip.
   - **Effort:** S/M

10. **P1 · C (Offline/Connectivity)** — Supabase realtime filter likely invalid (subquery in filter string).
    - **Evidence:** [golf-ryder-cup-web/src/lib/supabase/client.ts](../golf-ryder-cup-web/src/lib/supabase/client.ts) — `filter: session_id=in.(SELECT id FROM sessions WHERE trip_id=eq.${tripId})`.
    - **Impact:** Subscription may become unfiltered, pulling all match updates.
    - **Recommendation:** Precompute session IDs and use `in.(...)` list.
    - **Effort:** S

11. **P1 · A (Correctness & Domain Logic)** — Final 18th‑hole win displays as “1&0”.
    - **Evidence:** [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts) — `formatMatchScore()` returns `${absScore}&${holesRemaining}` when `isClosedOut` is true (holesRemaining can be 0).
    - **Impact:** Wrong match result display for a 1‑up finish on 18.
    - **Recommendation:** Special‑case holesRemaining = 0 to render “1 up”.
    - **Effort:** S

12. **P1 · B (Data Integrity)** — Share‑code generator uses `gen_random_bytes` without enabling `pgcrypto`.
    - **Evidence:** [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql) — `generate_share_code()` uses `gen_random_bytes`, but only `uuid-ossp` extension is enabled.
    - **Impact:** Insert into `trips` can fail at runtime.
    - **Recommendation:** `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` or swap to `md5(random())` only.
    - **Effort:** S

13. **P2 · A (Correctness & Domain Logic)** — `useMatchScoring` compares gross strokes only (no handicap/format logic).
    - **Evidence:** [golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts](../golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts) — `winner` determined by `team1Score < team2Score`.
    - **Impact:** If reused for net scoring or fourball, winners can be wrong.
    - **Recommendation:** Route all winner calculations through handicap/match format logic.
    - **Effort:** M

14. **P2 · F (Testing & Tooling)** — API rate limiting uses in‑memory map (not distributed).
    - **Evidence:** [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts) — `rateLimitStore` is process‑local.
    - **Impact:** Limits reset on cold starts; easy to bypass across instances.
    - **Recommendation:** Use Redis/Upstash or edge rate limiting.
    - **Effort:** M

15. **P2 · D (Security & Privacy)** — CSP permits `unsafe-inline` and `unsafe-eval`.
    - **Evidence:** [golf-ryder-cup-web/next.config.ts](../golf-ryder-cup-web/next.config.ts) `Content-Security-Policy` includes `'unsafe-eval'` and `'unsafe-inline'`.
    - **Impact:** Increases XSS risk surface.
    - **Recommendation:** Remove unsafe directives where possible (or restrict to dev only).
    - **Effort:** M

16. **P2 · B (Data Integrity)** — Dexie schema does not enforce domain invariants.
    - **Evidence:** [golf-ryder-cup-web/src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts) — no validation for `holeResults` or `matches` beyond indexed fields.
    - **Impact:** Invalid hole numbers or winners can be inserted by sync/import code.
    - **Recommendation:** Add validation in write paths and sanity checks on sync.
    - **Effort:** M

17. **P2 · C (Offline/Connectivity)** — Background sync marks events as synced without server acknowledgment in local‑only mode.
    - **Evidence:** [golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts](../golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts) — `syncMatchEvents()` sets local synced state when Supabase URL absent.
    - **Impact:** Switching to cloud later loses historical events.
    - **Recommendation:** Keep local “pending” events until a confirmed server sync.
    - **Effort:** S

18. **P2 · C (Offline/Connectivity)** — Realtime connections duplicated (multiple client creators).
    - **Evidence:** [golf-ryder-cup-web/src/lib/supabase/client.ts](../golf-ryder-cup-web/src/lib/supabase/client.ts) and [golf-ryder-cup-web/src/lib/hooks/useRealtimeScoring.ts](../golf-ryder-cup-web/src/lib/hooks/useRealtimeScoring.ts) both create Supabase clients.
    - **Impact:** Extra sockets, higher battery/network usage in low‑signal conditions.
    - **Recommendation:** Reuse a single Supabase client module for realtime.
    - **Effort:** S

19. **P2 · E (Performance & UX)** — Service worker caches app shell but match‑specific routes aren’t precached.
    - **Evidence:** [golf-ryder-cup-web/public/sw.js](../golf-ryder-cup-web/public/sw.js) — `APP_SHELL` includes `/score` but not `/score/[matchId]`.
    - **Impact:** Offline navigation to a match may show generic offline page.
    - **Recommendation:** Cache match pages or store last‑viewed match offline.
    - **Effort:** M

20. **P2 · G (Observability & Ops)** — Critical actions lack structured telemetry.
    - **Evidence:** Scoring flows (`recordHoleResult`, `executeScore`) log locally but do not emit structured events beyond optional Sentry. See [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts) and [golf-ryder-cup-web/src/app/score/[matchId]/page.tsx](../golf-ryder-cup-web/src/app/score/%5BmatchId%5D/page.tsx).
    - **Impact:** Hard to diagnose real‑time scoring failures in the field.
    - **Recommendation:** Emit minimal analytics events (score entered, undo, sync error).
    - **Effort:** S/M
