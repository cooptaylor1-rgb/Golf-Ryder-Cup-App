# QA Simulation Report: 100-Trip User Test

**Date:** January 2025
**Version:** v1.0
**Testing Environment:** Next.js 16.1.1, React 19.2.3, TypeScript 5

---

## Executive Summary

Comprehensive code audit and QA simulation of the Golf Ryder Cup App uncovered **23 issues** across 4 severity levels:

| Severity | Count | Description |
|----------|-------|-------------|
| **P0 - Critical** | 2 | Application crashes, data corruption |
| **P1 - High** | 7 | Incorrect functionality, major UX issues |
| **P2 - Medium** | 9 | Edge cases, minor data inconsistencies |
| **P3 - Low** | 5 | Cosmetic issues, code quality |

**Test Coverage:**

- Unit tests: 433 passing (18 test files)
- Lint: 566 warnings, 0 errors
- Type check: Passing

---

## P0 - Critical Issues (Fix Immediately)

### BUG-001: Race Condition in Undo Stack Reconstruction

| Field | Value |
|-------|-------|
| **File** | `src/lib/stores/scoringStore.ts` |
| **Lines** | 163-185 |
| **Category** | Data |
| **Impact** | Undo may restore incorrect state |

**Description:**
When reconstructing the undo stack from scoring events, the code finds the previous result by searching current `holeResults`, but this doesn't match the actual previous state before the event was recorded. This causes incorrect undo behavior when a hole was edited multiple times.

**Reproduction Steps:**

1. Score hole 1 (Team A wins)
2. Edit hole 1 (change to halved)
3. Edit hole 1 again (Team B wins)
4. Undo → Expected: halved, Actual: Team A wins (original state)

**Suggested Fix:**

```typescript
// Store the actual previous result in the event payload
interface ScoringEvent {
  // existing fields...
  previousState?: HoleResult | null; // Add this
}
```

---

### BUG-002: Division by Zero in Handicap Calculation

| Field | Value |
|-------|-------|
| **File** | `src/lib/services/handicapCalculator.ts` |
| **Lines** | 47 |
| **Category** | Crash |
| **Impact** | App crashes with malformed course data |

**Description:**
If `slopeRating` is 0 or `NaN` (from malformed course data), the handicap calculation produces `Infinity` or `NaN`, which propagates through the UI causing display errors.

**Reproduction Steps:**

1. Import course with slope rating = 0
2. Create match with that course
3. View handicap strokes → Shows NaN

**Suggested Fix:**

```typescript
export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number
): number {
  // Validate inputs
  if (!Number.isFinite(slopeRating) || slopeRating <= 0) {
    slopeRating = 113; // USGA standard slope
  }
  // ... rest of calculation
}
```

---

## P1 - High Priority Issues

### BUG-003: Missing Null Check in User Match Lookup

| Field | Value |
|-------|-------|
| **File** | `src/app/page.tsx` |
| **Lines** | 80-92 |
| **Category** | UX |

**Description:**
`currentUserPlayer` lookup uses optional chaining but can cause silent failures when matching by name with undefined `firstName`/`lastName` on the `currentUser` object.

**Suggested Fix:**
Add explicit null guards before comparison.

---

### BUG-004: Stale Closure in useEffect Dependencies

| Field | Value |
|-------|-------|
| **File** | `src/app/page.tsx` |
| **Lines** | 68-73 |
| **Category** | Data |

**Description:**
The `loadTrip` function from store may change reference but isn't stable, causing potential issues with effect re-runs.

---

### BUG-005: Award Calculation Win Percentage Division by Zero

| Field | Value |
|-------|-------|
| **File** | `src/lib/services/awardsService.ts` |
| **Lines** | 106-108 |
| **Category** | Data |

**Description:**
Win percentage calculation only guards `matchesPlayed === 0` but the sort function uses `matchesPlayed` which could still affect rankings for players with 0 matches.

---

### BUG-006: Hardcoded "Team USA" Check in Fairness Score

| Field | Value |
|-------|-------|
| **File** | `src/lib/services/tournamentEngine.ts` |
| **Lines** | 381 |
| **Category** | Data |

**Description:**
`const isTeamA = team?.name === 'Team USA';` fails for custom team names, causing all players to be counted as Team B.

**Suggested Fix:**

```typescript
// Use teamId instead of name comparison
const isTeamA = team?.id === teams[0]?.id;
```

---

### BUG-007: Match State Not Updated After Closeout

| Field | Value |
|-------|-------|
| **File** | `src/lib/stores/scoringStore.ts` |
| **Lines** | 266-284 |
| **Category** | Data |

**Description:**
After scoring a closing hole, `matchState` is computed but the underlying `Match` record in the database still shows status 'inProgress'.

---

### BUG-008: Empty Hole Handicaps Array Causes Invalid Stroke Allocation

| Field | Value |
|-------|-------|
| **File** | `src/lib/services/handicapCalculator.ts` |
| **Lines** | 73-78 |
| **Category** | Data |

**Description:**
Function validates length != 18 but returns empty array without warning, causing strokes to not be allocated.

---

### BUG-009: Tournament Engine Magic Number Uses Hardcoded 14.5

| Field | Value |
|-------|-------|
| **File** | `src/lib/services/tournamentEngine.ts` |
| **Lines** | 309 |
| **Category** | Data |

**Description:**
Points to win is hardcoded as 14.5 but trips can have custom `pointsToWin` settings.

---

## P2 - Medium Priority Issues

| ID | File | Description |
|----|------|-------------|
| BUG-010 | scoringEngine.ts | No session lock check in undoLastScore |
| BUG-011 | score/page.tsx | Missing error boundary in match list |
| BUG-012 | tournamentEngine.ts | Projected points doesn't weight by holes remaining |
| BUG-013 | authStore.ts | LocalStorage JSON parse error not fully handled |
| BUG-014 | score/page.tsx | useLiveQuery loading state not distinct from empty |
| BUG-015 | awardsService.ts | Player stats double-counting partners in team formats |
| BUG-016 | standings/page.tsx | pointsToWin fallback uses || instead of ?? |
| BUG-017 | scoringEngine.ts | Match result type doesn't handle all margins |
| BUG-018 | handicapCalculator.ts | Greensomes handicap missing validation |

---

## P3 - Low Priority Issues

| ID | File | Description |
|----|------|-------------|
| BUG-019 | handicapCalculator.ts | Console warning in production |
| BUG-020 | page.tsx | MomentumCard component is dead code |
| BUG-021 | Multiple | Inconsistent team color constants |
| BUG-022 | standings/page.tsx | Missing aria-labels on tab buttons |
| BUG-023 | tripStatsService.ts | Type assertion without validation |

---

## Recommendations

### Immediate Actions (This Sprint)

1. Fix P0 bugs (undo race condition, division by zero)
2. Add input validation to handicap calculator
3. Replace hardcoded team name checks with ID-based logic

### Short-term (Next 2 Sprints)

1. Implement error boundaries around all list components
2. Add comprehensive integration tests for scoring edge cases
3. Standardize team color/name constants

### Long-term

1. Consider Zod for runtime validation of database records
2. Implement optimistic locking for concurrent scoring
3. Add telemetry for error tracking in production

---

## Test Artifacts

- Test harness: [`scripts/generate-test-data.ts`](../golf-ryder-cup-web/scripts/generate-test-data.ts)
- E2E simulation: [`e2e/qa-simulation.spec.ts`](../golf-ryder-cup-web/e2e/qa-simulation.spec.ts)

---

*Report generated by QA simulation against commit HEAD*
