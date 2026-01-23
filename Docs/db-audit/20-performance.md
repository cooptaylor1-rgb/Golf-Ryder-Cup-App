# Database Performance Analysis

> **Audit Date:** January 2026
> **Focus:** Indexing, Query Patterns, Scaling Readiness

---

## Executive Summary

The schema has **good indexing coverage** for the current use case but has several areas that could become bottlenecks at scale:

- ✅ All foreign keys are indexed
- ⚠️ Missing composite indexes for common query patterns
- ⚠️ No partial indexes for status-based filtering
- ❌ No pagination strategy documented

---

## Index Coverage Analysis

### Current Indexes (23 total)

| Category | Count | Status |
|----------|-------|--------|
| Primary Keys (implicit) | 16 | ✅ |
| Foreign Key Indexes | 15 | ✅ |
| Timestamp Indexes | 2 | ✅ |
| Text Search Indexes | 3 | ⚠️ B-tree only |
| Composite Indexes | 0 | ❌ |
| Partial Indexes | 0 | ❌ |

### Missing Indexes (Recommended)

#### High Priority

```sql
-- Composite index for trip dashboard (sessions by trip + date)
CREATE INDEX idx_sessions_trip_date
ON sessions(trip_id, scheduled_date);

-- Composite index for match queries (session + status)
CREATE INDEX idx_matches_session_status
ON matches(session_id, status);

-- Partial index for active matches only
CREATE INDEX idx_matches_active
ON matches(id, session_id, current_hole)
WHERE status = 'inProgress';

-- Composite index for hole results ordering
CREATE INDEX idx_hole_results_match_hole
ON hole_results(match_id, hole_number);
```

#### Medium Priority

```sql
-- Index for share code lookups (heavily used)
CREATE INDEX idx_trips_share_code
ON trips(share_code)
WHERE share_code IS NOT NULL;

-- Index for course search by name (case-insensitive)
CREATE INDEX idx_course_library_name_lower
ON course_library(LOWER(name));

-- Index for finding unsynced courses
CREATE INDEX idx_course_library_unsynced
ON course_library(id)
WHERE created_by IS NOT NULL;
```

---

## Query Pattern Analysis

### Pattern 1: Trip Dashboard Load

**Observed Query Pattern:**

```sql
SELECT * FROM trips WHERE id = ?;
SELECT * FROM teams WHERE trip_id = ?;
SELECT * FROM sessions WHERE trip_id = ? ORDER BY session_number;
SELECT * FROM matches WHERE session_id IN (?);
```

**Optimization:** Use a single query with JOINs or batch fetch.

**Recommended:**

```sql
SELECT
    t.*,
    json_agg(DISTINCT teams.*) as teams,
    json_agg(DISTINCT sessions.* ORDER BY sessions.session_number) as sessions
FROM trips t
LEFT JOIN teams ON teams.trip_id = t.id
LEFT JOIN sessions ON sessions.trip_id = t.id
WHERE t.id = ?
GROUP BY t.id;
```

### Pattern 2: Live Scoring Updates

**Observed Pattern:** Real-time subscriptions + frequent polling

**Current Issue:**

- `hole_results` subscription has no filter → receives ALL changes
- Client filters client-side

**Recommended Server-Side Filter:**

```sql
-- In client.ts realtime subscription
.on(
    'postgres_changes',
    {
        event: '*',
        schema: 'public',
        table: 'hole_results',
        filter: `match_id=in.(${matchIds.join(',')})`,  // Add filter
    },
    ...
)
```

### Pattern 3: Standings Calculation

**Current:** Uses `live_standings` view with complex aggregation

**View Definition:**

```sql
SELECT
    t.id as trip_id,
    ...
    COALESCE(SUM(
        CASE
            WHEN teams.color = 'usa' AND m.result LIKE 'teamAWin%' THEN s.points_per_match
            ...
        END
    ), 0) as points
FROM trips t
JOIN teams ON teams.trip_id = t.id
LEFT JOIN sessions s ON s.trip_id = t.id
LEFT JOIN matches m ON m.session_id = s.id AND m.status = 'completed'
GROUP BY t.id, t.name, teams.id, teams.name, teams.color;
```

**Issue:** Full table scan on every call. No materialization.

**Recommendations:**

1. Add materialized view for standings (refresh on match complete)
2. Or cache standings in `trips` table with trigger updates

---

## Array Column Performance

### Current Array Usage

| Table | Column | Max Expected Size |
|-------|--------|-------------------|
| `matches` | `team_a_player_ids` | 2 |
| `matches` | `team_b_player_ids` | 2 |
| `tee_sets` | `hole_handicaps` | 18 |
| `tee_sets` | `hole_pars` | 18 |
| `tee_sets` | `yardages` | 18 |
| `course_library_tee_sets` | `hole_pars` | 18 |
| `course_library_tee_sets` | `hole_handicaps` | 18 |
| `course_library_tee_sets` | `hole_yardages` | 18 |

**Issues:**

1. No GIN indexes for array containment queries
2. No CHECK constraints on array length

**Recommendations:**

```sql
-- Add length constraints
ALTER TABLE tee_sets
ADD CONSTRAINT chk_hole_handicaps_length
CHECK (array_length(hole_handicaps, 1) = 18);

-- Add GIN index if searching by player ID
CREATE INDEX idx_matches_player_ids
ON matches USING GIN (team_a_player_ids, team_b_player_ids);
```

---

## Connection Pooling

### Current Configuration (client.ts)

```typescript
const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    realtime: {
        params: {
            eventsPerSecond: 10,  // Rate limited
        },
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});
```

**Observations:**

- Single client instance (good - singleton pattern)
- Rate limited realtime (10 events/sec)
- No connection pooling configured (using Supabase defaults)

**Supabase Defaults:**

- Connection pool: ~20 connections per project (free tier)
- Realtime connections: 200 concurrent (free tier)

### Recommendations

For production at scale:

1. Use pgBouncer connection pooling URL
2. Implement request batching for bulk operations
3. Add connection health monitoring

---

## Estimated Data Growth

### Per Trip (Typical)

| Entity | Count | Size Est. |
|--------|-------|-----------|
| Trip | 1 | ~500 bytes |
| Players | 12 | ~6 KB |
| Teams | 2 | ~1 KB |
| Team Members | 12 | ~3 KB |
| Sessions | 5 | ~2.5 KB |
| Matches | 25 | ~25 KB |
| Hole Results | 450 (25 × 18) | ~45 KB |
| **Total per trip** | | **~85 KB** |

### Scaling Projections

| Users | Trips/Year | Data/Year | 5-Year Total |
|-------|------------|-----------|--------------|
| 100 | 200 | ~17 MB | ~85 MB |
| 1,000 | 2,000 | ~170 MB | ~850 MB |
| 10,000 | 20,000 | ~1.7 GB | ~8.5 GB |

**Conclusion:** Data volume is not a concern. Focus on query performance.

---

## Realtime Performance

### Current Subscriptions

| Channel | Tables | Filter | Est. Events/Match |
|---------|--------|--------|-------------------|
| `trip:{id}` | matches, hole_results, sessions | partial | ~50-100 |

### Bottleneck Analysis

1. **Unfiltered `hole_results` Subscription**
   - Receives all hole results for all matches
   - At scale, could receive 1000s of irrelevant events

2. **Presence Tracking**
   - Each user tracks presence in trip channel
   - 12 users × 10 events/sec = 120 events/sec potential

**Recommendations:**

1. Add match-level filtering to hole_results subscription
2. Reduce presence update frequency (every 30s instead of continuous)
3. Use Supabase Broadcast for ephemeral scoring events

---

## VACUUM & Maintenance

### Recommended Autovacuum Settings

```sql
-- High-write tables need aggressive vacuuming
ALTER TABLE hole_results SET (
    autovacuum_vacuum_threshold = 50,
    autovacuum_analyze_threshold = 50
);

ALTER TABLE matches SET (
    autovacuum_vacuum_threshold = 50,
    autovacuum_analyze_threshold = 50
);

-- Audit log can accumulate dead tuples
ALTER TABLE audit_log SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.05
);
```

---

## Summary: Performance Priorities

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| P0 | Add composite indexes | High | Low |
| P0 | Filter realtime subscriptions | High | Low |
| P1 | Add partial indexes | Medium | Low |
| P1 | Optimize standings view | Medium | Medium |
| P2 | Add array constraints | Low | Low |
| P2 | Configure autovacuum | Low | Low |

---

## Next Steps

See [30-ops-runbook.md](./30-ops-runbook.md) for operational procedures.
