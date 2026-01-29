# AUDIT 3 — Offline + Sync Hardening

## Current Sync Model (as implemented)

**Local persistence**

- Dexie/IndexedDB stores trips, matches, hole results, and scoring events.
  - Source: [golf-ryder-cup-web/src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts)

**Background sync for scoring events**

- Scoring events are queued locally and synced via `/api/sync/scores`.
  - Source: [golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts](../golf-ryder-cup-web/src/lib/services/backgroundSyncService.ts), [golf-ryder-cup-web/src/app/api/sync/scores/route.ts](../golf-ryder-cup-web/src/app/api/sync/scores/route.ts)

**Trip‑level sync**

- `tripSyncService` syncs trips/matches/hole_results via Supabase upserts.
  - Source: [golf-ryder-cup-web/src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts)

**Realtime updates**

- Live updates with Supabase Realtime / Postgres changes.
  - Source: [golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts](../golf-ryder-cup-web/src/lib/services/liveUpdatesService.ts), [golf-ryder-cup-web/src/lib/services/realtimeSyncService.ts](../golf-ryder-cup-web/src/lib/services/realtimeSyncService.ts)

**PWA + offline shell**

- Service worker caches the app shell and provides offline fallback.
  - Source: [golf-ryder-cup-web/public/sw.js](../golf-ryder-cup-web/public/sw.js)

## Observed Gaps & Risks

- **Queue persistence:** `tripSyncService` queue is in‑memory only (lost on reload).
- **Queue correctness:** `useOfflineQueue` is a stub (random success, localStorage only).
- **Payload mismatch:** background sync payload does not match `/api/sync/scores` validation.
- **Realtime scoping:** live updates are not trip‑filtered for `hole_results`.

## Guardrails to Add (small PR‑sized)

1. **Durable queue**: Persist `SyncQueueItem` in Dexie; hydrate on app start.
2. **Contract‑safe payloads**: Make `backgroundSyncService` conform to `scoreSyncPayloadSchema` and add tests.
3. **Conflict detection**: Add `lastEditedAt`/`lastEditedBy` to `hole_results` and reject stale updates in API.
4. **Scoped realtime**: Filter realtime subscriptions to a trip’s matches only.
5. **Idempotency**: Add idempotency keys for `/api/sync/scores` and handle retries safely.

## Small PR Plan (preview)

- **PR‑A:** Fix score sync payload mismatch + tests.
- **PR‑B:** Persist sync queue in Dexie and replay after restart.
- **PR‑C:** Realtime scoping filters to reduce leakage and noise.

(Full PR sequencing is listed in AUDIT_5_pr_plan.md)
