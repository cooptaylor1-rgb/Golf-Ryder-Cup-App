# AUDIT 2 — Scoring Engine Deep Dive

## 1) Current Model (entities, relationships, algorithm)

**Primary entities**

- **Match**: core unit of competition (team A vs team B) with status and metadata.
  - Source: [golf-ryder-cup-web/src/lib/types/models.ts](../golf-ryder-cup-web/src/lib/types/models.ts)
- **HoleResult**: per‑hole winner + optional strokes.
  - Source: [golf-ryder-cup-web/src/lib/types/models.ts](../golf-ryder-cup-web/src/lib/types/models.ts)
- **ScoringEvent**: append‑only event log for scoring (for undo/sync).
  - Source: [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts), [golf-ryder-cup-web/src/lib/types/events.ts](../golf-ryder-cup-web/src/lib/types/events.ts)

**Storage layers**

- **Local:** Dexie/IndexedDB tables for matches, hole results, scoring events.
  - Source: [golf-ryder-cup-web/src/lib/db/index.ts](../golf-ryder-cup-web/src/lib/db/index.ts)
- **Cloud:** Supabase Postgres tables + realtime.
  - Source: [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql)

**Algorithm (match play)**

- `calculateMatchState()` sorts hole results, counts holes won, computes `currentScore`, `holesRemaining`, dormie/closeout flags, and the display score.
  - Source: [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)
- `calculateMatchPoints()` converts completed match results into Ryder Cup points (1 / 0.5 / 0).
  - Source: [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)
- `recordHoleResult()` upserts the hole result in local Dexie and appends a scoring event (event sourcing for undo/sync).
  - Source: [golf-ryder-cup-web/src/lib/services/scoringEngine.ts](../golf-ryder-cup-web/src/lib/services/scoringEngine.ts)

**Related logic**

- `useMatchScoring()` recalculates match status from hole results (independent implementation).
  - Source: [golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts](../golf-ryder-cup-web/src/lib/hooks/useMatchScoring.ts)
- Fourball input calculates best‑ball net for the hole and submits the winning team.
  - Source: [golf-ryder-cup-web/src/components/scoring/FourballScoreEntry.tsx](../golf-ryder-cup-web/src/components/scoring/FourballScoreEntry.tsx)
- Handicap allocations for foursomes/fourball/singles are in the handicap calculator.
  - Source: [golf-ryder-cup-web/src/lib/services/handicapCalculator.ts](../golf-ryder-cup-web/src/lib/services/handicapCalculator.ts)

## 2) Ambiguous Rules & Assumptions (needs explicit confirmation)

- **Match length:** Scoring engine assumes 18 holes (`TOTAL_HOLES = 18`), with no config from match/session.
- **Final result formatting:** For a 1‑up win on 18, the display shows `1&0` today (should be `1 up`).
- **Fourball storage:** UI collects per‑player scores but only best‑ball strokes are persisted; player scores are dropped.
- **Edits/undo:** Undo logic depends on scoring event ordering and may not be deterministic across devices if event timestamps collide.
- **Handicap application:** Winner calculation in `useMatchScoring` is gross strokes; net/allowance application is handled elsewhere and not unified.

## 3) Deterministic Test Suite (added)

**New tests added**

- **Golden match‑type tests**: singles, foursomes, fourball (match‑play outcome from hole winners)
- **Invariant check**: points sum to 1 only for completed matches

**Test file**

- [golf-ryder-cup-web/src/**tests**/scoringEngine.matchTypes.test.ts](../golf-ryder-cup-web/src/__tests__/scoringEngine.matchTypes.test.ts)

**Existing coverage**

- Scoring engine behavior: [golf-ryder-cup-web/src/**tests**/scoringEngine.test.ts](../golf-ryder-cup-web/src/__tests__/scoringEngine.test.ts)
- Handicap rules (singles/foursomes/fourball allowances): [golf-ryder-cup-web/src/**tests**/handicapScoring.test.ts](../golf-ryder-cup-web/src/__tests__/handicapScoring.test.ts)

## 4) Risks to Address (summary)

- Divergent scoring logic across `scoringEngine`, `useMatchScoring`, and `spectatorService`
- Missing persistence for per‑player fourball scores
- Match formatting edge case on 18th hole

## 5) Immediate, Low‑Risk Fix Candidates

- Normalize `formatMatchScore()` for 18th‑hole wins.
- Refactor `useMatchScoring` to rely on `scoringEngine` helpers to remove logic drift.
- Extend `hole_results` schema to support per‑player strokes (arrays) and wire through `handleFourballScore()`.
