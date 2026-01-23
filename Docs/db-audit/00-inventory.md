# Database Inventory

> **Audit Date:** January 2026
> **Auditor:** Senior Postgres + Supabase Reliability Engineer
> **Application:** Golf Ryder Cup App

---

## Executive Summary

The Golf Ryder Cup App uses a **hybrid offline-first architecture**:

- **Primary Store:** IndexedDB via Dexie (client-side, offline-capable)
- **Cloud Sync:** Supabase PostgreSQL (optional, for multi-device/multi-user sync)
- **Real-time:** Supabase Realtime channels for live scoring updates

---

## 1. Database Touchpoints

### 1.1 Supabase Configuration Files

| File | Purpose |
|------|---------|
| [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql) | Main schema definition (614 lines) |
| [golf-ryder-cup-web/supabase/migrations/20260121000000_fix_security_issues.sql](../golf-ryder-cup-web/supabase/migrations/20260121000000_fix_security_issues.sql) | Security migration (RLS + views) |

### 1.2 Supabase Client Files

| File | Purpose |
|------|---------|
| [src/lib/supabase/client.ts](../golf-ryder-cup-web/src/lib/supabase/client.ts) | Client initialization, realtime channels |
| [src/lib/supabase/types.ts](../golf-ryder-cup-web/src/lib/supabase/types.ts) | TypeScript types for all tables (623 lines) |
| [src/lib/supabase/syncService.ts](../golf-ryder-cup-web/src/lib/supabase/syncService.ts) | Bidirectional sync service |
| [src/lib/supabase/useRealtime.ts](../golf-ryder-cup-web/src/lib/supabase/useRealtime.ts) | React hook for realtime subscriptions |
| [src/lib/supabase/index.ts](../golf-ryder-cup-web/src/lib/supabase/index.ts) | Module exports |

### 1.3 API Routes with Supabase Access

| Route | Tables Accessed | Operation |
|-------|-----------------|-----------|
| [src/app/api/sync/scores/route.ts](../golf-ryder-cup-web/src/app/api/sync/scores/route.ts) | `scoring_events`, `matches` | INSERT, UPDATE |

### 1.4 Services Using Supabase

| Service | Tables Accessed |
|---------|-----------------|
| [src/lib/services/courseLibrarySyncService.ts](../golf-ryder-cup-web/src/lib/services/courseLibrarySyncService.ts) | `course_library`, `course_library_tee_sets` |
| [src/lib/services/tripSyncService.ts](../golf-ryder-cup-web/src/lib/services/tripSyncService.ts) | All trip-related tables |
| [src/components/social/PhotoGallery.tsx](../golf-ryder-cup-web/src/components/social/PhotoGallery.tsx) | `photos` |

### 1.5 Local Database (IndexedDB via Dexie)

| File | Purpose |
|------|---------|
| [src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts) | Dexie schema (482 lines) |
| [src/lib/db/seed.ts](../golf-ryder-cup-web/src/lib/db/seed.ts) | Demo data seeding |

---

## 2. Tables Inventory

### 2.1 Core Tables (16 total)

| Table | Schema Location | RLS | Realtime | FK Cascades |
|-------|-----------------|-----|----------|-------------|
| `trips` | L10-21 | ✅ | ❌ | N/A |
| `players` | L42-55 | ✅ | ❌ | N/A |
| `teams` | L59-72 | ✅ | ❌ | `trips(id) CASCADE` |
| `team_members` | L77-88 | ✅ | ❌ | `teams(id), players(id) CASCADE` |
| `sessions` | L93-108 | ✅ | ✅ | `trips(id) CASCADE` |
| `courses` | L113-126 | ✅ | ❌ | N/A |
| `tee_sets` | L130-146 | ✅ | ❌ | `courses(id) CASCADE` |
| `course_library` | L156-185 | ✅ | ❌ | N/A |
| `course_library_tee_sets` | L188-208 | ✅ | ❌ | `course_library(id) CASCADE` |
| `matches` | L243-268 | ✅ | ✅ | `sessions(id) CASCADE` |
| `hole_results` | L273-288 | ✅ | ✅ | `matches(id) CASCADE` |
| `photos` | L293-308 | ✅ | ✅ | `trips(id) CASCADE`, `matches(id) SET NULL` |
| `comments` | L313-326 | ✅ | ✅ | `trips(id) CASCADE`, `matches(id) SET NULL` |
| `side_bets` | L331-349 | ✅ | ❌ | `trips(id) CASCADE`, `matches(id) SET NULL` |
| `achievements` | L354-370 | ✅ | ❌ | `players(id), trips(id) CASCADE` |
| `audit_log` | L375-387 | ✅ | ❌ | `trips(id) CASCADE` |

### 2.2 Views (2 total)

| View | Type | Security |
|------|------|----------|
| `live_standings` | Aggregation | `SECURITY INVOKER` ✅ |
| `active_matches` | Filter | `SECURITY INVOKER` ✅ |

### 2.3 Missing Table ⚠️

| Table | Referenced In | Issue |
|-------|---------------|-------|
| `scoring_events` | `src/app/api/sync/scores/route.ts:64` | **NOT IN SCHEMA** |

---

## 3. Functions & Triggers

### 3.1 Functions (3 total)

| Function | Type | Security |
|----------|------|----------|
| `generate_share_code()` | TRIGGER | VOLATILE |
| `update_updated_at_column()` | TRIGGER | VOLATILE |
| `increment_course_usage()` | RPC | `SECURITY DEFINER` ⚠️ |
| `update_course_usage()` | TRIGGER | VOLATILE |

### 3.2 Triggers (11 total)

| Trigger | Table | Event |
|---------|-------|-------|
| `trip_share_code_trigger` | `trips` | BEFORE INSERT |
| `update_trips_updated_at` | `trips` | BEFORE UPDATE |
| `update_players_updated_at` | `players` | BEFORE UPDATE |
| `update_teams_updated_at` | `teams` | BEFORE UPDATE |
| `update_sessions_updated_at` | `sessions` | BEFORE UPDATE |
| `update_courses_updated_at` | `courses` | BEFORE UPDATE |
| `update_tee_sets_updated_at` | `tee_sets` | BEFORE UPDATE |
| `update_matches_updated_at` | `matches` | BEFORE UPDATE |
| `update_side_bets_updated_at` | `side_bets` | BEFORE UPDATE |
| `update_course_library_updated_at` | `course_library` | BEFORE UPDATE |
| `update_course_library_tee_sets_updated_at` | `course_library_tee_sets` | BEFORE UPDATE |

---

## 4. Indexes

### 4.1 Explicit Indexes (15 total)

| Index | Table | Column(s) |
|-------|-------|-----------|
| `idx_teams_trip_id` | `teams` | `trip_id` |
| `idx_team_members_team_id` | `team_members` | `team_id` |
| `idx_team_members_player_id` | `team_members` | `player_id` |
| `idx_sessions_trip_id` | `sessions` | `trip_id` |
| `idx_tee_sets_course_id` | `tee_sets` | `course_id` |
| `idx_course_library_name` | `course_library` | `name` |
| `idx_course_library_location` | `course_library` | `location` |
| `idx_course_library_state` | `course_library` | `state` |
| `idx_course_library_tee_sets_course` | `course_library_tee_sets` | `course_library_id` |
| `idx_matches_session_id` | `matches` | `session_id` |
| `idx_matches_status` | `matches` | `status` |
| `idx_hole_results_match_id` | `hole_results` | `match_id` |
| `idx_photos_trip_id` | `photos` | `trip_id` |
| `idx_photos_match_id` | `photos` | `match_id` |
| `idx_comments_trip_id` | `comments` | `trip_id` |
| `idx_comments_match_id` | `comments` | `match_id` |
| `idx_comments_created_at` | `comments` | `created_at DESC` |
| `idx_side_bets_trip_id` | `side_bets` | `trip_id` |
| `idx_side_bets_match_id` | `side_bets` | `match_id` |
| `idx_achievements_player_id` | `achievements` | `player_id` |
| `idx_achievements_trip_id` | `achievements` | `trip_id` |
| `idx_audit_log_trip_id` | `audit_log` | `trip_id` |
| `idx_audit_log_timestamp` | `audit_log` | `timestamp DESC` |

---

## 5. Realtime Subscriptions

### 5.1 Realtime-Enabled Tables

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE hole_results;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
```

### 5.2 Client-Side Subscription Filters

| Table | Filter Used |
|-------|-------------|
| `matches` | `session_id=in.(SELECT id FROM sessions WHERE trip_id=eq.{tripId})` |
| `hole_results` | _(none - all changes)_ |
| `sessions` | `trip_id=eq.{tripId}` |

---

## 6. Environment Variables

| Variable | Scope | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | ✅ (for sync) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | ✅ (for sync) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | ✅ (for API routes) |

---

## 7. Edge Functions / RPCs

| Name | File | Security |
|------|------|----------|
| `increment_course_usage` | schema.sql:L212 | `SECURITY DEFINER` ⚠️ |

---

## 8. Storage Buckets

**None configured.** Photo storage uses external URLs (`photos.url` field).

---

## 9. Cron Jobs / Background Tasks

**None configured in Supabase.**

Client-side uses:

- Network listeners for online/offline sync
- Debounced sync queue processing
- Background Sync API for offline scoring

---

## 10. Seed Scripts

| Script | Purpose |
|--------|---------|
| [scripts/testing/seed-small.ts](../golf-ryder-cup-web/scripts/testing/seed-small.ts) | Small test dataset |
| [scripts/testing/seed-large.ts](../golf-ryder-cup-web/scripts/testing/seed-large.ts) | Large test dataset |
| [src/lib/db/seed.ts](../golf-ryder-cup-web/src/lib/db/seed.ts) | Demo data (IndexedDB) |

---

## Next Steps

See [10-rls-report.md](./10-rls-report.md) for the security audit.
