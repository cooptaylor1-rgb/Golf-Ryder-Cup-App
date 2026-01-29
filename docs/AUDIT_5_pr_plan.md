# AUDIT 5 — Staged PR Plan

> Goal: small, reviewable PRs (≤300 LOC diff each), preserve behavior except bug fixes.

## PR #1 — Scoring tests + correctness guardrails

**Scope**

- Add match‑type golden tests (singles/foursomes/fourball)
- Fix `undoLastScore()` ordering bug
- Fix 18th‑hole display score formatting

**Files**

- [golf-ryder-cup-web/src/**tests**/scoringEngine.matchTypes.test.ts](../golf-ryder-cup-web/src/__tests__/scoringEngine.matchTypes.test.ts)
- [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)

**Acceptance criteria**

- Tests pass for match‑type outcomes
- Undo always reverts the most recent scoring action
- 18th‑hole wins display as “1 up” (not “1&0”)

**Verify locally**

- `pnpm -C golf-ryder-cup-web test -- --runInBand` (or `pnpm -C golf-ryder-cup-web test`)

**Rollback**

- Revert scoringEngine changes; tests remain additive and can be dropped if needed

---

## PR #2 — Data validation + invariants

**Scope**

- Validate `hole_results` write inputs (hole number, winner)
- Add schema guardrails to reject invalid writes in sync/import paths
- Add sanity checks for duplicates in `calculateMatchState()`

**Files**

- [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)
- [golf-ryder-cup-web/src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts)
- [golf-ryder-cup-web/src/lib/validations/api.ts](../golf-ryder-cup-web/src/lib/validations/api.ts)

**Acceptance criteria**

- Invalid hole results are rejected with a clear error
- Duplicate hole results are de‑duplicated or rejected deterministically

**Verify locally**

- `pnpm -C golf-ryder-cup-web test -- --runInBand`

**Rollback**

- Revert validation guards; no schema change required

---

## PR #3 — Offline/sync hardening

**Scope**

- Fix score sync payload shape to match `scoreSyncPayloadSchema`
- Persist `tripSyncService` queue in Dexie
- Replace `useOfflineQueue` stub with real sync calls or remove if unused
- Scope live updates to trip matches only

**Files**

- [golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts](../golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts)
- [golf-ryder-cup-web/src/lib/validations/api.ts](../golf-ryder-cup-web/src/lib/validations/api.ts)
- [golf-ryder-cup-web/src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts)
- [golf-ryder-cup-web/src/lib/hooks/useOfflineQueue.ts](../golf-ryder-cup-web/src/lib/hooks/useOfflineQueue.ts)
- [golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts](../golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts)

**Acceptance criteria**

- Offline scores sync successfully after reconnect
- Queue persists across reloads
- Live updates only process a single trip

**Verify locally**

- Run `pnpm -C golf-ryder-cup-web test` and simulate offline/online in browser

**Rollback**

- Revert queue persistence and keep existing local-only behavior

---

## PR #4 — Security hardening

**Scope**

- Lock down Supabase RLS policies
- Require share code or auth for API routes
- Add auth/ownership checks to push subscription API

**Files**

- [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql)
- [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts)
- [golf-ryder-cup-web/src/app/api/push/subscribe/route.ts](../golf-ryder-cup-web/src/app/api/push/subscribe/route.ts)

**Acceptance criteria**

- Anonymous clients cannot read/write other trips
- API routes require share code or membership
- Push subscriptions cannot be created without authorization

**Verify locally**

- Run tests + manual API calls with/without `X-Share-Code`

**Rollback**

- Revert RLS and middleware changes; re‑deploy schema migration rollback

---

## PR #5 — Performance & UX

**Scope**

- Reduce duplicate realtime connections
- Improve offline navigation to active match
- Add minimal telemetry hooks for score entry/undo/sync failures

**Files**

- [golf-ryder-cup-web/src/lib/hooks/useRealtimeScoring.ts](../golf-ryder-cup-web/src/lib/hooks/useRealtimeScoring.ts)
- [golf-ryder-cup-web/public/sw.js](../golf-ryder-cup-web/public/sw.js)
- [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)

**Acceptance criteria**

- Only one realtime client instance per app session
- Offline navigation returns last active match UI
- Critical actions emit structured telemetry events

**Verify locally**

- Manual testing on mobile emulator with network throttling

**Rollback**

- Revert telemetry hooks and SW changes
