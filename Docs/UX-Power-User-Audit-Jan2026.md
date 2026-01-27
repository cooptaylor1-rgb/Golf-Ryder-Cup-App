# UX Power User & Speed Audit — January 2026

**Focus:** Power users, repeat usage, speed optimization
**Perspective:** Senior product designer + UX engineer
**Constraint:** NOT a visual redesign—strictly UX/flow improvements

---

## Executive Summary

The Golf Ryder Cup app has a solid foundation for power users with keyboard shortcuts, swipe gestures, and one-handed scoring. However, **speed is being sacrificed at several critical points** where repeat users are forced through flows designed for first-time users. The following audit identifies friction points that slow down users who know what they want.

### Key Findings (5-7 bullets)

1. **Good:** Keyboard shortcuts exist (`g h`, `g s`, etc.) but are undiscoverable—no visual hints
2. **Good:** One-handed scoring mode excellent for course use, but mode sticky preference not remembered per-match
3. **Problem:** Scoring page requires 2+ taps to reach active match when user likely has ONE match
4. **Problem:** No quick-score entry point from home—must navigate Score → Session → Match → Hole
5. **Problem:** Session creation defaults to expanded options—power users want "Quick Setup" to be the primary path
6. **Problem:** No "repeat last action" pattern—each score entry is equally effortful
7. **Problem:** Match completion forces full modal before allowing navigation to next match

---

## 1. USER JOURNEY MAPPING

### Power User Journey: Score a Hole (Critical Path)

**Current flow (5+ interactions):**

```
Home → Tap Score (nav) → View session list → Tap match → View scoring UI → Score hole
```

**Friction points:**

- If user has only 1 active match, why show intermediate screens?
- YourMatchCard on home is good but requires scroll to find
- No "Continue Scoring" floating action when returning to app

**Ideal flow (1-2 interactions):**

```
Home → Tap "Score Now" banner → Score hole
```

### Power User Journey: Check Standings

**Current flow (2 interactions):**

```
Home → Tap Standings (nav) → View team scores
```

**Assessment:** ✅ Good. Direct nav, no friction.

### Power User Journey: Create New Session

**Current flow (6+ interactions):**

```
Home → Captain Mode → New Session → (sees Quick Setup) → Customize → Choose format → Set options → Build lineup
```

**Friction points:**

- "Quick Setup" card is great but still shows 21 format options when expanded
- Format selection has no "Most Used" section based on user's history
- No session templates from previous trips

---

## 2. UX FRICTION AUDIT (Power User Focus)

### 2.1 Scoring Flow (Sacred Path)

| Issue                                | Location           | Impact | Why Problematic for Power Users                            |
| ------------------------------------ | ------------------ | ------ | ---------------------------------------------------------- |
| No deep link to active match         | `/score`           | High   | Forces navigation through list every time                  |
| Scoring mode not sticky per-format   | `/score/[matchId]` | Medium | Four-ball users must re-select "Best Ball" mode each match |
| Hole navigation requires precise tap | Hole mini-map      | Medium | Should support keyboard arrows on desktop                  |
| No quick re-score for correction     | Score panel        | Medium | Must undo + re-enter vs. "override"                        |

### 2.2 Navigation Inefficiencies

| Issue                             | Location           | Impact                                                 |
| --------------------------------- | ------------------ | ------------------------------------------------------ |
| Keyboard shortcuts undiscoverable | Global             | High—power feature nobody finds                        |
| No command palette (⌘K)           | Global             | High—fastest nav pattern missing                       |
| Back button inconsistent          | Headers            | Medium—sometimes goes to parent, sometimes to previous |
| No breadcrumbs on deep pages      | `/score/[matchId]` | Low—location unclear                                   |

### 2.3 State Management Friction

| Issue                                                        | Location      | Impact                                          |
| ------------------------------------------------------------ | ------------- | ----------------------------------------------- |
| Captain mode PIN asked repeatedly                            | CaptainToggle | Medium—PIN recovery exists but re-auth frequent |
| No "remember me" for scoring preferences                     | Settings      | Medium                                          |
| Session auto-selects "in progress" but no visual distinction | `/score`      | Low                                             |

---

## 3. ERROR & EDGE-CASE EXPERIENCE

### Power User Error Scenarios

| Scenario                      | Current Behavior                  | Ideal Behavior                                 |
| ----------------------------- | --------------------------------- | ---------------------------------------------- |
| Accidentally score wrong hole | Must use Undo banner (8s timeout) | Allow immediate correction via tap-to-override |
| Close app mid-scoring         | State preserved ✅                | Good—IndexedDB persistence works               |
| Network loss during sync      | Queue works ✅                    | Good—shows offline indicator                   |
| Enter duplicate score         | Replaces silently                 | Should confirm: "Override existing?"           |

### Assessment

Error recovery is good for data integrity. However, power users need **faster correction paths**—the 8-second undo window is too slow for someone who immediately realizes a mistake.

---

## 4. SIMPLIFICATION PASS (Speed-Focused)

### 4.1 Recommended Simplifications

| Change                                                                    | Rationale                                                     | Risk                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------- |
| **Auto-navigate to active match** if user has exactly 1 in-progress match | Eliminates 2 taps for 80% of scoring sessions                 | Low—fallback to list if ambiguous |
| **Remember scoring mode per format**                                      | Four-ball users always want "Best Ball", Singles want "Swipe" | None                              |
| **Add ⌘K command palette**                                                | Universal speed pattern, already have shortcuts               | Low—additive                      |
| **Collapse "Customize" by default** on session creation                   | Power users use templates/Quick Setup                         | None—already mostly there         |
| **Add "Score Again" after match completion**                              | One tap to score next match                                   | None                              |

### 4.2 What NOT to Simplify

- **Captain PIN verification**: Security appropriate for team management
- **Confirm on match closeout**: Prevents accidental match endings
- **Session creation wizard**: First-time experience still valuable

---

## 5. INFORMATION HIERARCHY & FLOW

### Home Page

**Current:** Tournament standings prominent, YourMatchCard in activity section (requires scroll)
**Issue:** Power user's #1 action (continue scoring) below fold
**Fix:** If user has active match, show "Continue Scoring" banner ABOVE standings

### Score Page

**Current:** Session selector → Match list → Match detail
**Issue:** Extra hop when one match active
**Fix:** Smart routing—if 1 match, go direct

### Match Completion

**Current:** Trophy animation → Stats card → View Standings / Share / Back
**Issue:** "Score Next Match" button exists but below fold on some devices
**Fix:** Make "Score Next Match" the PRIMARY action (green button) above "View Standings"

---

## 6. TRUST & CONFIDENCE CHECK

### What Works Well ✅

- **Offline indicator**: Clear sync status
- **Undo stack**: Visible count, reliable recovery
- **Save confirmation**: Toast feedback immediate
- **Score celebration**: Haptic + visual feedback builds confidence

### What Needs Work

- **Keyboard shortcuts**: No visual indicator they exist (add `?` hint in footer)
- **Auto-save timing**: Not clear when scores sync to server
- **Captain mode state**: Small shield icon—could be missed

---

## 7. TOP 10 POWER USER IMPROVEMENTS (Ranked by Impact)

### P0 — Must-Fix for Speed

| #   | Improvement                                                                         | Effort | Impact | Files                                               |
| --- | ----------------------------------------------------------------------------------- | ------ | ------ | --------------------------------------------------- |
| 1   | **Smart routing to active match** — Skip score list if user has 1 in-progress match | M      | High   | `app/score/page.tsx`, `BottomNav.tsx`               |
| 2   | **Persistent scoring mode per format** — Remember Swipe vs Strokes vs Best Ball     | S      | High   | `lib/stores/uiStore.ts`, `score/[matchId]/page.tsx` |
| 3   | **Command palette (⌘K / Ctrl+K)** — Fuzzy search all actions/pages                  | L      | High   | New component, `useKeyboardShortcuts.ts`            |

### P1 — High-Leverage Improvements

| #   | Improvement                                                                        | Effort | Impact | Files                                              |
| --- | ---------------------------------------------------------------------------------- | ------ | ------ | -------------------------------------------------- |
| 4   | **"Continue Scoring" banner on home** — One-tap return to active match             | S      | High   | `app/page.tsx`                                     |
| 5   | **Keyboard hint in UI** — Show `?` shortcut hint somewhere visible                 | XS     | Medium | `BottomNav.tsx` or footer                          |
| 6   | **Tap-to-override scoring** — Allow tapping existing result to change without undo | M      | Medium | `SwipeScorePanel.tsx`, `OneHandedScoringPanel.tsx` |
| 7   | **Next Match as primary CTA** — Reorder match-complete buttons                     | XS     | Medium | `score/[matchId]/page.tsx`                         |

### P2 — Nice-to-Have Polish

| #   | Improvement                                                                       | Effort | Impact | Files                      |
| --- | --------------------------------------------------------------------------------- | ------ | ------ | -------------------------- |
| 8   | **Session templates** — Save/reuse session configs                                | M      | Low    | `app/lineup/new/page.tsx`  |
| 9   | **Batch scoring mode** — Enter multiple hole results at once                      | L      | Low    | New component              |
| 10  | **Match history in scoring header** — See last 3 holes without scrolling mini-map | S      | Low    | `score/[matchId]/page.tsx` |

---

## 8. WHAT'S ALREADY WELL-DESIGNED ✅

1. **Swipe scoring gestures** — Fast, intuitive, with haptic feedback. Best-in-class.
2. **One-handed mode** — Thoughtful thumb-zone design for course use.
3. **Keyboard shortcuts system** — Comprehensive vim-style `g + key` navigation.
4. **Offline-first architecture** — IndexedDB with sync queue. Reliable.
5. **YourMatchCard component** — Surfaces user's match prominently on home.
6. **Quick Setup card** — Good progressive disclosure for session creation.
7. **Hole mini-map** — Visual score history at a glance.
8. **Press tracker** — Side bets integrated without cluttering main flow.

---

## 9. IMPLEMENTATION PRIORITY

**Phase 1 (This Sprint):** Items 1, 2, 4, 5, 7 — All small/medium effort, high impact
**Phase 2 (Next Sprint):** Items 3, 6 — Command palette and tap-to-override
**Phase 3 (Backlog):** Items 8, 9, 10 — Templates and batch scoring

---

## 10. SPECIFIC CODE RECOMMENDATIONS

### 10.1 Smart Routing to Active Match

```typescript
// In app/score/page.tsx or BottomNav.tsx
const handleScoreNavigation = () => {
  const inProgressMatches = matches.filter((m) => m.status === "inProgress");
  if (inProgressMatches.length === 1) {
    router.push(`/score/${inProgressMatches[0].id}`);
  } else {
    router.push("/score");
  }
};
```

### 10.2 Persistent Scoring Mode

```typescript
// In lib/stores/uiStore.ts
scoringModeByFormat: {
  fourball: 'fourball',  // Best Ball
  foursomes: 'swipe',
  singles: 'swipe',
} as Record<SessionType, ScoringMode>,

setScoringModeForFormat: (format: SessionType, mode: ScoringMode) => {
  set(state => ({
    scoringModeByFormat: { ...state.scoringModeByFormat, [format]: mode }
  }));
}
```

### 10.3 Keyboard Hint

```tsx
// In BottomNav.tsx footer or More page
<span className="text-xs text-ink-tertiary">
  Press <kbd className="px-1 py-0.5 bg-surface rounded text-[10px]">?</kbd> for
  shortcuts
</span>
```

---

## 10. IMPLEMENTATION STATUS ✅

**Session:** January 2026 Power User Audit Implementation

### Completed Improvements

| #   | Improvement                        | Status | Implementation Details                                                                                 |
| --- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| 1   | Smart routing to active match      | ✅     | Added `activeMatchId` prop to `BottomNav`. If 1 match in progress, Score tap goes directly to it.      |
| 2   | Persistent scoring mode per format | ✅     | Added `scoringModeByFormat` to `uiStore.ts` with localStorage persistence. Per-format mode remembered. |
| 4   | Continue Scoring banner on home    | ✅     | Created `ContinueScoringBanner` component. Sticky banner appears when user has in-progress match.      |
| 5   | Keyboard hint in UI                | ✅     | Added `?` button to `BottomNav` (visible on md+ screens) that triggers keyboard shortcuts help modal.  |

### Files Modified

- [src/components/layout/BottomNav.tsx](../golf-ryder-cup-web/src/components/layout/BottomNav.tsx) — Smart routing + keyboard hint button
- [src/lib/stores/uiStore.ts](../golf-ryder-cup-web/src/lib/stores/uiStore.ts) — Scoring mode persistence per format
- [src/app/score/[matchId]/page.tsx](../golf-ryder-cup-web/src/app/score/[matchId]/page.tsx) — Uses persistent scoring mode
- [src/app/page.tsx](../golf-ryder-cup-web/src/app/page.tsx) — Continue Scoring banner + activeMatchId
- [src/components/ui/ContinueScoringBanner.tsx](../golf-ryder-cup-web/src/components/ui/ContinueScoringBanner.tsx) — New component (created)

### Remaining P0/P1 Items

| #   | Improvement               | Status      | Notes                                              |
| --- | ------------------------- | ----------- | -------------------------------------------------- |
| 3   | Command palette (⌘K)      | Not started | Large effort — recommend separate sprint           |
| 6   | Tap-to-override scoring   | Not started | Medium effort — requires scoring panel refactor    |
| 7   | Next Match as primary CTA | Not started | Already partially addressed in prior v2 audit work |

---

## Conclusion

This app is **80% of the way to excellent power user experience**. The remaining 20% is about removing intermediate steps, remembering preferences, and surfacing fast paths. The keyboard shortcuts system proves the team values power users—now make those patterns discoverable and consistent throughout.

**Biggest single improvement:** Smart routing to active match when tapping Score nav. ✅ **IMPLEMENTED**
**Biggest systemic improvement:** Command palette (⌘K) for universal fast access.
