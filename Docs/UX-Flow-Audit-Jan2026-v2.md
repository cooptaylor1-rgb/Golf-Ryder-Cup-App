# UX Flow Audit Report — January 2026 (v2)

**Date:** January 27, 2026
**Auditor:** Senior Product Designer / UX Engineer
**Scope:** Comprehensive user journey mapping, friction audit, error handling, simplification pass
**Perspective:** First-time user + Senior UX reviewer
**Build Reviewed:** Post-implementation of v1 recommendations

---

## Executive Summary

This Golf Ryder Cup Tracker app has **strong foundational UX** with excellent offline-first architecture, premium visual design, and thoughtful empty states. The previous audit (v1) successfully addressed profile simplification, scoring mode tooltips, Quick Setup, and collapsible sections.

### 🟢 What's Working Exceptionally Well

1. **YourMatchCard** — 1-tap scoring access is exactly right. Users see their match immediately and can enter scores without hunting.

2. **Swipe-to-score** — The gesture-based scoring is premium and fast. Haptic feedback and celebrations create delightful moments.

3. **Empty states** — Every empty state has a beautiful illustration, clear explanation, and actionable CTA. No dead ends.

4. **Offline-first architecture** — Data saves locally, sync queue is visible, "Will sync when online" messaging builds trust.

5. **Error pages** — Golf-themed 404 ("Lost in the Rough") and clear recovery paths on error pages.

6. **Captain mode toggle** — Moving this to the header was the right call. Captains can switch modes without navigation.

7. **Join Trip Modal** — Clean flow with share code input, immediate feedback, and success animation.

### 🟡 Remaining Medium Friction Areas

1. **Session creation still complex** — Quick Setup helps but 21 format options create analysis paralysis
2. **Schedule page tab labels** — "My" vs "All" is ambiguous
3. **Match complete state** — No celebration for participants, just "Match Complete"
4. **Player bulk add** — Exists but poorly discoverable

### 🔴 New Issues Identified

1. **No back button from profile create to landing** — Users who tap "Create Profile" then change their mind are stuck
2. **Format explanations only on hover** — Mobile users can't hover, need tap-to-reveal
3. **Captain PIN recovery path missing** — "Forgot PIN?" goes nowhere

---

## 1. User Journey Mapping

### Journey A: First-Time Participant (Joining via Share Code)

| Step | Screen         | Actions                           | Friction              | Grade |
| ---- | -------------- | --------------------------------- | --------------------- | ----- |
| 1    | App Launch     | Land on empty state               | Clear, welcoming      | 🟢 A  |
| 2    | Home           | Tap "Join a Trip"                 | Obvious CTA           | 🟢 A  |
| 3    | Join Modal     | Enter 6-char code                 | Input is large, clear | 🟢 A  |
| 4    | Profile Create | Enter 3 fields (name, email, PIN) | ✅ Fixed in v1        | 🟢 A  |
| 5    | Home           | See trip with YourMatchCard       | Immediate value       | 🟢 A  |
| 6    | Score          | Tap YourMatchCard, score          | 1 tap to scoring      | 🟢 A  |

**Journey Grade: A** — This is now an excellent first-time flow.

**Potential Hesitation Points:**

- Step 3: "What if I don't have the code?" → Add helper text "Ask the trip captain"
- Step 4: "Why do I need a PIN?" → Good: existing hint explains this

---

### Journey B: First-Time Captain (Creating Trip + Setting Up)

| Step | Screen        | Actions                        | Friction              | Grade |
| ---- | ------------- | ------------------------------ | --------------------- | ----- |
| 1    | Home          | Tap "Create Trip"              | Clear                 | 🟢 A  |
| 2    | Quick Start   | Step through wizard (4 steps)  | Good flow             | 🟢 A  |
| 3    | Home          | Land on home with setup guide  | Excellent guidance    | 🟢 A  |
| 4    | Players       | Add players one-by-one or bulk | Bulk not obvious      | 🟡 B  |
| 5    | Draft         | Assign to teams                | Requires navigation   | 🟡 B  |
| 6    | Lineup/New    | Create session                 | **21 format options** | 🟠 C  |
| 7    | LineupBuilder | Assign players to matches      | Drag-drop works       | 🟢 A  |
| 8    | Home          | Ready to score                 | Good state            | 🟢 A  |

**Journey Grade: B** — Steps 4-6 could be streamlined.

**Key Friction Points:**

- Step 4: "+" button for bulk add is not discoverable (looks like single add)
- Step 5: Draft could be inline in Players page
- Step 6: Too many format choices without clear recommendation

---

### Journey C: Returning User (Score Today's Match)

| Step | Screen    | Actions                       | Friction  | Grade |
| ---- | --------- | ----------------------------- | --------- | ----- |
| 1    | Home      | See YourMatchCard immediately | Excellent | 🟢 A  |
| 2    | Score     | Tap card, land on scoring     | 1 tap     | 🟢 A  |
| 3    | Score     | Swipe/tap to record hole      | Premium   | 🟢 A  |
| 4    | Score     | Continue through 18           | Smooth    | 🟢 A  |
| 5    | Match End | See result                    | Clean     | 🟢 A  |

**Journey Grade: A** — This is the strongest flow in the app.

---

### Journey D: Power User (Rapid Multi-Match Scoring)

| Step | Screen     | Actions                        | Friction          | Grade |
| ---- | ---------- | ------------------------------ | ----------------- | ----- |
| 1    | Score list | Find next match to score       | Requires scanning | 🟡 B  |
| 2    | Score      | Quick score with One-Hand mode | Good              | 🟢 A  |
| 3    | Score      | Navigate to next match         | Back + select     | 🟡 B  |

**Journey Grade: B** — Could benefit from "Next Match" quick navigation.

---

## 2. UX Friction Audit

### 2.1 Unclear Labels & Terminology

| Location         | Issue                                           | Severity | Recommendation                             |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------ |
| Schedule tabs    | "My" vs "All" is vague                          | Medium   | Change to "Your Matches" / "Full Schedule" |
| Session creation | "Foursomes" vs "Fourball" confusion             | Low      | ✅ Tooltips added in v1                    |
| More page        | "Exit Trip" might imply delete                  | Medium   | Change to "Switch Trip" or "Leave Trip"    |
| Scoring modes    | "Strokes" vs "Swipe" not intuitive to new users | Low      | ✅ Onboarding tip added in v1              |

### 2.2 Too Many Required Decisions

| Flow                    | Decision Count      | Cognitive Load | Recommendation                                    |
| ----------------------- | ------------------- | -------------- | ------------------------------------------------- |
| Session creation        | 21 format options   | 🔴 High        | Add "Popular for your group" filter showing top 4 |
| Profile (optional step) | 12+ optional fields | 🟡 Medium      | ✅ Already deferred in v1                         |
| Quick Start wizard      | 4 steps             | 🟢 Low         | Good — minimal required input                     |

### 2.3 Non-Obvious Next Steps

| Screen                | After What?  | What's Missing         | Recommendation                                          |
| --------------------- | ------------ | ---------------------- | ------------------------------------------------------- |
| After player bulk add | Save         | Prompt to assign teams | Show "Assign to teams?" modal                           |
| After match complete  | Final score  | Celebration + share    | Add celebration + "Share Result" CTA                    |
| After lineup publish  | Session view | Start session prompt   | Auto-show "Start Session?" if within 30 min of tee time |

### 2.4 Hidden UI Elements

| Element          | Where         | Issue                      | Recommendation                        |
| ---------------- | ------------- | -------------------------- | ------------------------------------- |
| Bulk player add  | Players page  | "+" looks like single add  | Rename to "Add Players" with dropdown |
| Fairness score   | LineupBuilder | Users don't understand it  | Add "What's this?" info button        |
| Press in scoring | PressTracker  | Power user feature, buried | Show only if user has pressed before  |

### 2.5 Memory-Dependent Flows

| Flow          | What User Must Remember       | Fix                                      |
| ------------- | ----------------------------- | ---------------------------------------- |
| Captain PIN   | "What PIN did I set?"         | Add "Forgot PIN?" with email reset       |
| Format rules  | "Is foursome alternate shot?" | Inline mini-description (✅ added in v1) |
| Which session | "Was it AM or PM?"            | Add date/time badge to session cards     |

---

## 3. Error & Edge-Case Experience

### 3.1 Error Handling Audit

| Scenario                     | Current Behavior            | Grade        | Recommendation       |
| ---------------------------- | --------------------------- | ------------ | -------------------- |
| Invalid share code           | Inline error message        | 🟢 Good      | —                    |
| Network offline during score | Saves locally, shows banner | 🟢 Excellent | —                    |
| Wrong PIN at login           | "Incorrect PIN" error       | 🟢 Good      | Add attempt counter? |
| Duplicate email in players   | ✅ Warning added in v1      | 🟢 Good      | —                    |
| Session with no players      | "Cannot publish" warning    | 🟢 Good      | —                    |
| Navigate away mid-score      | Score saved automatically   | 🟢 Good      | —                    |
| Match delete without players | Confirmation dialog         | 🟢 Good      | —                    |

### 3.2 Recovery Paths

| Error                        | Can Recover? | Path Clear?         | Improvement               |
| ---------------------------- | ------------ | ------------------- | ------------------------- |
| Wrong score entered          | ✅ Yes       | 🟢 Undo banner (8s) | ✅ Extended in v1         |
| Accidentally started session | ❌ No        | 🔴 None             | Add "Revert to Scheduled" |
| Lost network mid-sync        | ✅ Yes       | 🟢 Clear banner     | —                         |
| Forgot captain PIN           | ❌ No        | 🔴 None             | **Add email-based reset** |

### 3.3 System vs User Blame Audit

| Current Message                       | Tone             | Better Message                    |
| ------------------------------------- | ---------------- | --------------------------------- |
| "Failed to delete match"              | ⚠️ Blames action | "Couldn't delete. Try again?"     |
| "Handicap must be between -10 and 54" | ⚠️ Prescriptive  | "Enter a handicap from -10 to 54" |
| "Something went wrong"                | ✅ Neutral       | Keep                              |
| "Please enter a valid email"          | ⚠️ Blames user   | "This doesn't look like an email" |

---

## 4. Simplification Pass

### 4.1 Screens That Could Be Merged

| Current Screens         | Merge Into           | Rationale                     | Impact |
| ----------------------- | -------------------- | ----------------------------- | ------ |
| `/captain/draft`        | `/players` as tab    | Draft is just team assignment | Medium |
| `/captain/availability` | `/captain/checklist` | Both are "ready?" checks      | Low    |
| `/trip-stats`           | `/standings` as tab  | Related leaderboard data      | Medium |

### 4.2 Smart Defaults That Should Be Applied

| Field            | Current Default | Better Default         | Why                           |
| ---------------- | --------------- | ---------------------- | ----------------------------- |
| Session type     | None selected   | "Fourball (Best Ball)" | Most popular format           |
| Match count      | Empty           | 4                      | ✅ Added in Quick Setup       |
| Session date     | Empty           | Today                  | ✅ Added in v1                |
| Points per match | Empty           | 1                      | Standard scoring              |
| Time slot        | User selects    | Infer from time of day | If before 11 AM = AM, else PM |

### 4.3 Inputs That Can Be Inferred

| Input             | Currently   | Can Infer From                     |
| ----------------- | ----------- | ---------------------------------- |
| Player's team     | Manual drag | Previous trip team assignment      |
| Session time slot | Dropdown    | Current time (if before noon = AM) |
| First tee time    | Manual      | Course data (if available)         |

### 4.4 Actions That Can Be Deferred

| Action                         | Currently Required      | Defer To            |
| ------------------------------ | ----------------------- | ------------------- |
| Golf profile (handicap, GHIN)  | Optional step in create | ✅ Already deferred |
| Trip preferences (shirt, diet) | Previously step 3       | ✅ Already deferred |
| Course selection               | Session creation        | Start of match      |
| Emergency contact              | Profile create          | Before travel day   |

---

## 5. Information Hierarchy & Flow

### 5.1 Home Page Analysis

**Current Hierarchy (top to bottom):**

1. Header with Captain toggle ✅
2. YourMatchCard (if applicable) ✅ **Excellent placement**
3. Live Match Banner ✅
4. Setup Guide (captain only) ✅
5. Team Score Hero ✅
6. Quick Actions grid
7. Captain Tools
8. Weather Widget
9. Momentum Cards
10. Side Bets
11. Past Trips

**Issues:**

- 11 sections is high cognitive load
- Weather appears before Momentum (lower priority)
- Side Bets shown even when empty for captains

**Recommendation:**

1. Keep positions 1-5 (core value)
2. Merge Quick Actions + Captain Tools into one expandable section
3. Move Weather to Course Info or More
4. Only show Side Bets when bets exist
5. Remove Momentum cards (low utility vs. space)

**Target: Reduce to 6-7 sections**

### 5.2 Scoring Page Analysis

**Current Hierarchy:**

1. Match selector dropdown
2. Session tabs
3. Match cards
4. YourMatchCard highlighted (if applicable) ✅

**Issues:**

- User's match should be at the very top, always
- Session dropdown takes valuable screen space

**Recommendation:**

- Pin "Your Match" to top with clear highlight
- Collapse session dropdown into filter chips
- Gray out completed matches

### 5.3 More Page Analysis

**After v1:**

- ✅ Collapsible sections added
- ✅ Default expansion state set appropriately

**Remaining Issues:**

- "Demo Data" tools visible to all users (should be dev-only)
- Captain-only items still mixed with participant items in some sections

---

## 6. Trust & Confidence Check

### 6.1 Predictability Audit

| Interaction          | Predictable? | Notes                                    |
| -------------------- | ------------ | ---------------------------------------- |
| Swipe to score       | 🟡 Partially | ✅ Tip added, but gesture learning curve |
| Tap buttons to score | ✅ Yes       | Clear team labels                        |
| Captain mode toggle  | ✅ Yes       | Obvious on/off state                     |
| Undo score           | ✅ Yes       | ✅ 8s banner, clear position             |
| Delete match         | ✅ Yes       | Confirmation dialog                      |
| Auto-save            | ✅ Yes       | ✅ "Saving..." indicator added           |

### 6.2 State Communication

| State   | Communicated? | How                                  |
| ------- | ------------- | ------------------------------------ |
| Loading | ✅ Yes        | Skeleton loaders everywhere          |
| Saving  | ✅ Yes        | ✅ "Saving score..." indicator added |
| Success | ✅ Yes        | Toast + celebration animations       |
| Failure | ✅ Yes        | Red toast with error                 |
| Offline | ✅ Yes        | Persistent banner                    |
| Syncing | ✅ Yes        | Sync status badge                    |

### 6.3 "Magic" Without Explanation

| Feature                    | Explanation Exists? | Need                                   |
| -------------------------- | ------------------- | -------------------------------------- |
| Auto-handicap strokes      | ❌ No               | Add "Why did X get 2 strokes?" tooltip |
| Fairness score calculation | ❌ No               | Add info icon explaining formula       |
| Match state sync           | ✅ Works invisibly  | Good                                   |
| Press bets                 | ❌ No               | Add "What is a press?" helper          |

---

## 7. Top 10 UX Improvements Ranked by Impact

### 🔴 Must-Fix (P0) — Blocking or Confusing

| #   | Issue                               | Files                                  | Effort | Impact |
| --- | ----------------------------------- | -------------------------------------- | ------ | ------ |
| 1   | **Add Captain PIN recovery**        | `CaptainToggle.tsx`, new recovery flow | Medium | High   |
| 2   | **Filter session formats to Top 4** | `lineup/new/page.tsx`                  | Low    | High   |

### 🟠 High-Leverage (P1) — Significant Friction Reduction

| #   | Issue                                           | Files                      | Effort | Impact |
| --- | ----------------------------------------------- | -------------------------- | ------ | ------ |
| 3   | **Match complete celebration for participants** | `score/[matchId]/page.tsx` | Medium | Medium |
| 4   | **Rename schedule tabs**                        | `schedule/page.tsx`        | Low    | Low    |
| 5   | **Make bulk add more discoverable**             | `players/page.tsx`         | Low    | Medium |
| 6   | **Add "Next Match" quick nav after scoring**    | `score/[matchId]/page.tsx` | Medium | Medium |
| 7   | **Add "What's this?" to Fairness Score**        | `LineupBuilder.tsx`        | Low    | Low    |

### 🟡 Nice-to-Have Polish (P2)

| #   | Issue                                         | Files                               | Effort | Impact |
| --- | --------------------------------------------- | ----------------------------------- | ------ | ------ |
| 8   | **Merge draft into players page**             | `players/page.tsx`, `captain/draft` | High   | Medium |
| 9   | **Hide demo data tools in production**        | `more/page.tsx`                     | Low    | Low    |
| 10  | **Infer session time slot from current time** | `lineup/new/page.tsx`               | Low    | Low    |

---

## 8. Specific Implementation Recommendations

### P0-1: Captain PIN Recovery

**Problem:** If a captain forgets their PIN, there's no recovery path.

**Solution:**

```tsx
// In CaptainToggle.tsx, add to the PIN modal:
<button onClick={() => router.push("/captain/recover-pin")}>Forgot PIN?</button>

// New page: /captain/recover-pin
// 1. Enter email associated with trip captain
// 2. Send reset link (or show hint if set)
// 3. Allow resetting PIN
```

### P0-2: Filter Session Formats

**Problem:** 21 format options is overwhelming.

**Solution:**

```tsx
// In lineup/new/page.tsx, add:
const [showAllFormats, setShowAllFormats] = useState(false);

const POPULAR_FORMATS = ["fourball", "foursomes", "singles", "skins"];

// Show only popular by default with "Show all formats" button
```

### P1-1: Match Complete Celebration

**Problem:** When a participant's match ends, they just see "Match Complete" — no fanfare.

**Solution:**

```tsx
// In score/[matchId]/page.tsx match complete section:
// 1. Show confetti animation
// 2. Display winner prominently
// 3. Show stats: "You won 4 holes, halved 3"
// 4. Add "Share Result" button
// 5. Add "View Trip Standings" CTA
```

---

## 9. What's Excellent — Don't Change

1. **YourMatchCard positioning** — Top of home page, 1-tap scoring
2. **Swipe scoring gestures** — Haptics, animations, celebrations
3. **Offline architecture** — Transparent sync queue
4. **Empty states** — Beautiful illustrations, clear CTAs
5. **Profile creation simplification** — 3 fields is perfect
6. **Error/404 pages** — Golf-themed, helpful
7. **Undo banner** — 8 seconds is right, position is good
8. **Saving indicator** — Clear and timely
9. **Captain toggle in header** — Visible without navigation
10. **Collapsible More page** — Good progressive disclosure

---

## Appendix: Files Referenced

| File                                                                              | Purpose           | Lines |
| --------------------------------------------------------------------------------- | ----------------- | ----- |
| [page.tsx](golf-ryder-cup-web/src/app/page.tsx)                                   | Home page         | 1090  |
| [profile/create/page.tsx](golf-ryder-cup-web/src/app/profile/create/page.tsx)     | Profile creation  | 572   |
| [score/[matchId]/page.tsx](golf-ryder-cup-web/src/app/score/[matchId]/page.tsx)   | Scoring interface | 1212  |
| [lineup/new/page.tsx](golf-ryder-cup-web/src/app/lineup/new/page.tsx)             | Session creation  | 1101  |
| [LineupBuilder.tsx](golf-ryder-cup-web/src/components/captain/LineupBuilder.tsx)  | Match pairing     | 925   |
| [more/page.tsx](golf-ryder-cup-web/src/app/more/page.tsx)                         | Settings hub      | 1047  |
| [players/page.tsx](golf-ryder-cup-web/src/app/players/page.tsx)                   | Player management | 886   |
| [schedule/page.tsx](golf-ryder-cup-web/src/app/schedule/page.tsx)                 | Schedule view     | 592   |
| [standings/page.tsx](golf-ryder-cup-web/src/app/standings/page.tsx)               | Leaderboard       | 1059  |
| [CaptainToggle.tsx](golf-ryder-cup-web/src/components/ui/CaptainToggle.tsx)       | Captain mode UI   | 225   |
| [QuickStartWizard.tsx](golf-ryder-cup-web/src/components/ui/QuickStartWizard.tsx) | Trip creation     | 603   |
| [JoinTripModal.tsx](golf-ryder-cup-web/src/components/ui/JoinTripModal.tsx)       | Join trip flow    | 227   |
| [not-found.tsx](golf-ryder-cup-web/src/app/not-found.tsx)                         | 404 page          | 110   |
| [error.tsx](golf-ryder-cup-web/src/app/error.tsx)                                 | Error boundary    | 119   |

---

**Report Complete.**

_Overall Application Grade: **B+** — Strong foundational UX with excellent scoring flow and offline support. Remaining friction concentrated in captain setup flows and session creation complexity._
