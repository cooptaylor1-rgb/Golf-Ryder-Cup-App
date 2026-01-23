# Database Operations Runbook

> **Version:** 1.0
> **Last Updated:** January 2026

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Daily Operations](#2-daily-operations)
3. [Migration Procedures](#3-migration-procedures)
4. [Backup & Recovery](#4-backup--recovery)
5. [Monitoring & Alerting](#5-monitoring--alerting)
6. [Incident Response](#6-incident-response)
7. [Common Issues & Fixes](#7-common-issues--fixes)

---

## 1. Environment Setup

### 1.1 Required Access

| Resource | Access Level | Who Needs It |
|----------|--------------|--------------|
| Supabase Dashboard | Admin | DevOps, Lead Dev |
| Supabase SQL Editor | Admin | DBA, Lead Dev |
| Service Role Key | Secrets | API Server only |
| Database URL | Connection | CI/CD, Migrations |

### 1.2 CLI Tools

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to project (one-time setup)
cd golf-ryder-cup-web
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.3 Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only!

# Verify connection
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | jq
```

---

## 2. Daily Operations

### 2.1 Health Check

```sql
-- Check table sizes
SELECT
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as data_size,
    pg_size_pretty(pg_indexes_size(relid)) as index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Check active connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Check for long-running queries (>5 seconds)
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
AND state != 'idle'
ORDER BY duration DESC;
```

### 2.2 Check RLS Status

```sql
-- Verify RLS is enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- All should show `rowsecurity = true`
```

### 2.3 Check Realtime Status

```sql
-- List tables in realtime publication
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- Expected: matches, hole_results, sessions, comments, photos
```

---

## 3. Migration Procedures

### 3.1 Creating a Migration

```bash
# Create new migration file
supabase migration new descriptive_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql
```

### 3.2 Migration Template

```sql
-- Migration: YYYYMMDDHHMMSS_descriptive_name.sql
-- Description: What this migration does
-- Author: Your Name
-- Ticket: GOLF-123

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN;

-- Your changes here
ALTER TABLE ... ;

COMMIT;

-- ============================================
-- ROLLBACK (keep as comment for reference)
-- ============================================
-- BEGIN;
-- ALTER TABLE ... ;
-- COMMIT;
```

### 3.3 Deploying Migrations

```bash
# Preview changes (dry run)
supabase db diff

# Push to remote
supabase db push

# Or via SQL Editor in Dashboard for production
```

### 3.4 Migration Checklist

- [ ] Migration is idempotent (can run multiple times)
- [ ] Uses `IF NOT EXISTS` / `IF EXISTS` where appropriate
- [ ] RLS policies are included if adding tables
- [ ] Indexes are included for foreign keys
- [ ] Triggers are included for `updated_at`
- [ ] Rollback script is documented
- [ ] Tested locally first

---

## 4. Backup & Recovery

### 4.1 Supabase Automatic Backups

| Tier | Backup Frequency | Retention |
|------|------------------|-----------|
| Free | Daily | 7 days |
| Pro | Daily | 7 days |
| Team | Daily + PITR | 7 days |
| Enterprise | Custom | Custom |

### 4.2 Manual Backup (pg_dump)

```bash
# Get database URL from Supabase Dashboard > Settings > Database

# Full backup
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump "$DATABASE_URL" --schema-only > schema_backup.sql

# Data only
pg_dump "$DATABASE_URL" --data-only > data_backup.sql

# Specific tables
pg_dump "$DATABASE_URL" -t trips -t matches > trips_matches_backup.sql
```

### 4.3 Restore Procedure

```bash
# ⚠️ WARNING: This will overwrite data!

# Restore full backup
psql "$DATABASE_URL" < backup.sql

# Restore specific table (drop existing first)
psql "$DATABASE_URL" -c "TRUNCATE trips CASCADE;"
psql "$DATABASE_URL" < trips_backup.sql
```

### 4.4 Point-in-Time Recovery (PITR)

Available on Team/Enterprise plans via Supabase Dashboard:

1. Go to Database > Backups
2. Select "Point in Time Recovery"
3. Choose timestamp
4. Confirm recovery

---

## 5. Monitoring & Alerting

### 5.1 Key Metrics to Monitor

| Metric | Warning | Critical | Tool |
|--------|---------|----------|------|
| Connection Count | >15 | >18 | Supabase Dashboard |
| Query Duration | >1s | >5s | pg_stat_activity |
| Table Bloat | >20% | >50% | pg_stat_user_tables |
| Realtime Connections | >150 | >180 | Supabase Dashboard |
| API Requests/min | >800 | >950 | Supabase Dashboard |

### 5.2 Supabase Dashboard Monitoring

1. Go to **Reports > Database**
2. Check:
   - Query performance
   - Index usage
   - Cache hit ratio (should be >95%)

### 5.3 Custom Monitoring Query

```sql
-- Create monitoring view (run once)
CREATE OR REPLACE VIEW db_health AS
SELECT
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
    (SELECT count(*) FROM trips) as total_trips,
    (SELECT count(*) FROM matches WHERE status = 'inProgress') as active_matches,
    (SELECT pg_database_size(current_database())) as database_size_bytes,
    NOW() as checked_at;

-- Query it
SELECT * FROM db_health;
```

### 5.4 Setting Up Alerts

Use Supabase's built-in alerts or integrate with:

- **Sentry:** For error tracking (already configured)
- **PagerDuty/Opsgenie:** For critical alerts
- **Slack:** For non-critical notifications

---

## 6. Incident Response

### 6.1 Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P0 | Complete outage | 15 min | DB down, no connections |
| P1 | Major degradation | 1 hour | Slow queries, partial outage |
| P2 | Minor issue | 4 hours | Non-critical feature broken |
| P3 | Cosmetic/Low impact | 24 hours | Logging issues |

### 6.2 Incident Response Checklist

#### P0/P1 Immediate Actions

1. **Check Supabase Status** - <https://status.supabase.com>
2. **Check Vercel Status** - <https://www.vercel-status.com> (if deployed there)
3. **Verify Database Connectivity**

   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

4. **Check for Long-Running Queries**

   ```sql
   -- Kill if necessary
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE duration > interval '30 seconds'
   AND state = 'active';
   ```

5. **Check RLS Not Blocking**

   ```sql
   -- Temporarily test with service role
   -- (don't use anon key for this)
   ```

### 6.3 Rollback Procedure

```bash
# If a migration caused issues:

# 1. Identify the bad migration
supabase migration list

# 2. Apply rollback SQL manually via SQL Editor
# (Use the commented rollback from migration file)

# 3. Remove migration record
DELETE FROM supabase_migrations.schema_migrations
WHERE version = 'YYYYMMDDHHMMSS';
```

---

## 7. Common Issues & Fixes

### 7.1 "Permission Denied" Errors

**Symptom:** Client receives 403/permission denied

**Causes & Fixes:**

1. RLS policy missing → Add policy
2. Using anon key for admin operation → Use service role
3. Policy condition incorrect → Debug with `EXPLAIN`

```sql
-- Debug RLS
SET row_security TO off;  -- Temporarily disable (admin only)
SELECT * FROM trips WHERE id = 'xxx';
SET row_security TO on;   -- Re-enable
```

### 7.2 Realtime Not Working

**Symptom:** Changes not appearing in real-time

**Fixes:**

1. Check table is in publication:

   ```sql
   SELECT * FROM pg_publication_tables WHERE tablename = 'matches';
   ```

2. Check client subscription filter syntax
3. Check Supabase Realtime limits (200 connections free tier)

### 7.3 Slow Queries

**Symptom:** Dashboard shows slow queries

**Fixes:**

1. **Add missing index:**

   ```sql
   CREATE INDEX CONCURRENTLY idx_xxx ON table(column);
   ```

2. **Analyze table stats:**

   ```sql
   ANALYZE table_name;
   ```

3. **Check for bloat:**

   ```sql
   VACUUM ANALYZE table_name;
   ```

### 7.4 Connection Pool Exhausted

**Symptom:** "too many connections" error

**Fixes:**

1. Check for connection leaks in code
2. Reduce connection pool size in client
3. Use pgBouncer connection string
4. Upgrade Supabase tier

### 7.5 Share Code Collision

**Symptom:** Duplicate share code error

**Fix:** Regenerate share code:

```sql
UPDATE trips
SET share_code = UPPER(SUBSTRING(MD5(id::TEXT || NOW()::TEXT) FROM 1 FOR 8))
WHERE id = 'xxx';
```

---

## Appendix: Useful Scripts

### A.1 Reset Demo Data

```sql
-- ⚠️ DANGEROUS: Only run on development!
TRUNCATE trips CASCADE;
-- Then run seed script
```

### A.2 Find Orphaned Records

```sql
-- Find matches without sessions
SELECT m.id FROM matches m
LEFT JOIN sessions s ON m.session_id = s.id
WHERE s.id IS NULL;

-- Find team_members without teams
SELECT tm.id FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
WHERE t.id IS NULL;
```

### A.3 Export Trip Data

```sql
-- Export single trip as JSON
SELECT json_build_object(
    'trip', t.*,
    'teams', (SELECT json_agg(teams.*) FROM teams WHERE trip_id = t.id),
    'sessions', (SELECT json_agg(sessions.*) FROM sessions WHERE trip_id = t.id),
    'players', (SELECT json_agg(DISTINCT p.*)
                FROM players p
                JOIN team_members tm ON p.id = tm.player_id
                JOIN teams te ON tm.team_id = te.id
                WHERE te.trip_id = t.id)
) as trip_export
FROM trips t
WHERE t.id = 'YOUR_TRIP_ID';
```

---

## Contact & Escalation

| Issue Type | Primary Contact | Escalation |
|------------|-----------------|------------|
| Database Down | On-call Engineer | CTO |
| Data Corruption | DBA | Lead Engineer |
| Security Incident | Security Lead | CTO |
| Performance | Backend Lead | DBA |

---

## Next Steps

See [40-verification-tests.md](./40-verification-tests.md) for automated verification.
