# RLS & Security Audit Report

> **Audit Date:** January 2026
> **Risk Level:** 🔴 HIGH (requires immediate attention)

---

## Executive Summary

The Golf Ryder Cup App has **RLS enabled on all tables** but uses **wide-open permissive policies** (`USING (true)`) for most tables. This is intentional for the current share-code-based access model but presents significant security risks if the app scales or if Supabase credentials are compromised.

---

## 🔴 Top 10 Highest-Risk Findings

### 1. **CRITICAL: Missing `scoring_events` Table**

- **Location:** API route references non-existent table
- **File:** `src/app/api/sync/scores/route.ts:64`
- **Impact:** Sync operations will fail silently or throw errors
- **Fix Required:** Create `scoring_events` table in schema

### 2. **HIGH: All Tables Have Permissive RLS Policies**

- **Issue:** All 14 application tables have `USING (true)` policies
- **Impact:** Any authenticated/anonymous client can read/write all data
- **Mitigation:** Acceptable for share-code model, but consider:
  - Adding rate limiting at API layer
  - Implementing share-code validation in RLS

### 3. **HIGH: `SECURITY DEFINER` Function Without Validation**

- **Function:** `increment_course_usage(course_id UUID)`
- **Issue:** Runs with owner privileges, no input validation
- **Impact:** Potential for abuse if called with arbitrary UUIDs
- **Fix Required:** Add parameter validation, switch to `SECURITY INVOKER`

### 4. **MEDIUM: Service Role Key Used in API Route**

- **File:** `src/app/api/sync/scores/route.ts:13`
- **Issue:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely
- **Impact:** If API route has vulnerabilities, all data is exposed
- **Recommendation:** Use anon key with proper RLS instead

### 5. **MEDIUM: No Input Sanitization on `share_code` Generation**

- **Function:** `generate_share_code()`
- **Issue:** Uses MD5 hash truncated to 6 chars - collision risk
- **Impact:** ~17 million possible codes, brute-forceable
- **Fix:** Use longer codes (8+ chars) or cryptographic random

### 6. **MEDIUM: Missing `updated_at` Triggers on Some Tables**

- **Tables Without Triggers:** `team_members`, `hole_results`, `photos`, `comments`, `achievements`, `audit_log`
- **Impact:** Data staleness detection unreliable

### 7. **MEDIUM: Array Columns Without Validation**

- **Columns:** `team_a_player_ids`, `team_b_player_ids`, `hole_handicaps`, `hole_pars`, etc.
- **Issue:** No CHECK constraints on array length (should be 18 for holes)
- **Impact:** Data integrity issues possible

### 8. **LOW: Realtime Filter Uses Subquery**

- **Location:** `client.ts:83`
- **Filter:** `session_id=in.(SELECT id FROM sessions WHERE trip_id=eq.{tripId})`
- **Issue:** Complex filter may not work as expected
- **Recommendation:** Verify filter behavior or simplify

### 9. **LOW: No Audit Trail for DELETE Operations**

- **Issue:** `audit_log` table exists but no triggers capture deletes
- **Impact:** Cannot track who deleted data
- **Recommendation:** Add DELETE triggers or soft-delete pattern

### 10. **LOW: Device ID RLS Without Enforcement**

- **Table:** `course_library`
- **Issue:** Uses `current_setting('app.device_id', true)` but clients may not set this
- **Impact:** Update/delete policies may not work as intended

---

## RLS Policy Analysis

### Tables with Permissive Policies (All Operations Open)

| Table | SELECT | INSERT | UPDATE | DELETE | Risk |
|-------|--------|--------|--------|--------|------|
| `trips` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `teams` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `team_members` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `players` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `sessions` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `courses` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `tee_sets` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `matches` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `hole_results` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `photos` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `comments` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `side_bets` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `achievements` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |
| `audit_log` | `USING (true)` | `WITH CHECK (true)` | `USING (true)` | `USING (true)` | 🟡 |

### Tables with Conditional Policies

| Table | Policy | Condition |
|-------|--------|-----------|
| `course_library` | SELECT | `USING (true)` |
| `course_library` | INSERT | `WITH CHECK (true)` |
| `course_library` | UPDATE | `created_by IS NULL OR created_by = current_setting('app.device_id', true)` |
| `course_library` | DELETE | `created_by IS NULL OR created_by = current_setting('app.device_id', true)` |
| `course_library_tee_sets` | UPDATE/DELETE | Inherits from parent course |

---

## Function Security Analysis

### `increment_course_usage` (SECURITY DEFINER)

```sql
CREATE OR REPLACE FUNCTION increment_course_usage(course_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE course_library
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Issues:**

1. No validation that `course_id` exists
2. No rate limiting
3. Runs with owner privileges (bypasses RLS)

**Recommended Fix:**

```sql
CREATE OR REPLACE FUNCTION increment_course_usage(course_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Validate course exists
    IF NOT EXISTS (SELECT 1 FROM course_library WHERE id = course_id) THEN
        RAISE EXCEPTION 'Course not found';
    END IF;

    UPDATE course_library
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;  -- Changed from DEFINER
```

---

## Authentication Model

### Current State: Anonymous Access + Share Codes

```
┌─────────────────────────────────────────────────────────────┐
│                     Current Flow                             │
├─────────────────────────────────────────────────────────────┤
│  Client → Supabase (anon key) → RLS (USING true) → Data    │
│                                                              │
│  Access Control: Application-level share code validation    │
│  Trip Discovery: Only via share code (not browsable)        │
└─────────────────────────────────────────────────────────────┘
```

### Security Implications

| Scenario | Current Behavior | Risk |
|----------|------------------|------|
| User guesses share code | Can access full trip data | 🟡 Medium |
| User enumerates all trips | Possible (no pagination limit) | 🔴 High |
| User modifies other trip | Allowed by RLS | 🔴 High |
| API key leaked | Full DB access | 🔴 Critical |

---

## Recommendations

### Immediate (P0 - This Sprint)

1. **Create missing `scoring_events` table**
2. **Add rate limiting to API routes**
3. **Change `increment_course_usage` to SECURITY INVOKER**

### Short-term (P1 - Next Sprint)

1. **Implement share-code validation in RLS**

   ```sql
   CREATE POLICY "trips_select_by_code" ON trips
   FOR SELECT USING (
       share_code = current_setting('app.share_code', true)
       OR current_setting('app.share_code', true) IS NULL
   );
   ```

2. **Add missing `updated_at` triggers**

3. **Increase share code length to 8 characters**

### Long-term (P2 - Future)

1. **Consider Supabase Auth integration** for proper user identity
2. **Implement row-level ownership** for multi-tenant security
3. **Add soft-delete pattern** with `deleted_at` timestamps

---

## Compliance Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| RLS enabled on all tables | ✅ | |
| Views use SECURITY INVOKER | ✅ | Fixed in migration |
| No SECURITY DEFINER without validation | ⚠️ | 1 function needs fix |
| Input validation on RPCs | ❌ | Needs implementation |
| Rate limiting | ❌ | Not implemented |
| Audit logging | ⚠️ | Exists but incomplete |

---

## Next Steps

See [20-performance.md](./20-performance.md) for performance analysis.
