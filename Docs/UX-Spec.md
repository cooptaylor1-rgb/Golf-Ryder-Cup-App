# Buddies Trip Ryder Cup - UX Specification

## Product North Star

Create a "Trip Command Center" that makes a Ryder Cup-style buddies trip feel legendary:
- Everyone knows where to be, when, and who they're playing with
- Captains can set formats quickly and fairly
- Scoring is frictionless, accurate, and fun
- The app becomes the shared memory of the trip: moments, banter, standings, trophies

---

## Personas

### 1. The Captain
**Profile:** Organizes the trip, manages lineups, ensures fairness
**Goals:**
- Set up pairings quickly without complaints
- Balance teams for competitive matches
- Make changes on the fly when someone oversleeps
- Look authoritative with a polished schedule to share

**Pain Points:**
- Spreadsheet chaos, text thread arguments
- "Who's playing with whom?" questions all trip
- Manual score tracking errors
- No clear record of past matchups

**Key Flows:** Create session → Set format → Draft/assign pairings → Publish lineup → Lock after changes

### 2. The Player
**Profile:** Just wants to show up, know where to go, and play
**Goals:**
- See "where am I, when, with whom" instantly
- Check standings without asking
- Brag about wins in the group chat
- Relive great moments later

**Pain Points:**
- Missing tee times because info was buried in texts
- Not knowing current standings
- Manual score entry mistakes during round
- No photos or memories saved

**Key Flows:** Open app → See next match card → Score holes → Check standings

### 3. The Scorekeeper
**Profile:** Designated scorer for a group (often a player doubling up)
**Goals:**
- Enter scores fast between shots
- Never lose progress
- Correct mistakes easily
- Finalize when match is over

**Pain Points:**
- Phone locks mid-entry
- Fat-finger wrong hole
- Lost cell signal loses data
- "Wait, who won hole 7?"

**Key Flows:** Start match → Score each hole → Handle corrections → Finalize match

### 4. The "Checked-Out" Guy
**Profile:** Casual participant, minimal tech engagement
**Goals:**
- Know where to be (that's it)
- See if his team is winning
- Not touch the app if possible

**Pain Points:**
- App is too complicated
- Needs Wi-Fi to work
- Notifications spam

**Key Flows:** Open app → See next event card → Close app

---

## Top 10 Critical Flows

### Flow 1: First-Time Trip Setup (Captain)
```
1. Launch app → Empty state with "Create Your Trip" CTA
2. Enter trip name, dates, location
3. Add players (name + handicap minimum)
4. Create two teams (or use auto-draft)
5. Add courses (wizard or quick add)
6. Build schedule (days → sessions → tee times)
7. Publish to players (generates share card)
```
**Exit Criteria:** Trip is visible to all, schedule is populated

### Flow 2: View My Next Match (Player)
```
1. Open app → Home tab auto-selected
2. "Next Up" card shows:
   - Time (8:30 AM)
   - Course + hole 1 tee location
   - Format (Fourball Match Play)
   - Partner (if applicable)
   - Opponents with avatars
3. Tap card → Full match detail
4. "Start Scoring" CTA prominent
```
**Exit Criteria:** Player knows exactly where to be and with whom

### Flow 3: Score a Match Play Round
```
1. From Home or Score tab, tap "Score Now"
2. Select match (if multiple in progress)
3. Match header shows: Team A vs Team B, format
4. Per hole:
   - Big buttons: "+1 Team A" | "Halved" | "+1 Team B"
   - Current status: "Team A 2 UP through 6"
   - Hole indicator with swipe/tap navigation
5. Auto-advance after each hole scored
6. When match closes out or reaches 18:
   - "Confirm Final Result" prompt
   - Summary card with shareable result
7. Match moves to "Completed" status
```
**Exit Criteria:** Match result recorded, standings updated

### Flow 4: Set Session Pairings (Captain)
```
1. Matchups tab → Select session (e.g., "Friday AM Foursomes")
2. "Edit Pairings" enters captain mode
3. Interface shows:
   - Team A roster (left)
   - Team B roster (right)
   - Match slots in center
4. Drag players to slots OR tap "Auto-pair by handicap"
5. Validation shows:
   - Handicap spread warnings
   - Repeat partner warnings
   - Missing players alerts
6. "Save & Publish" locks lineup
7. Share card generated automatically
```
**Exit Criteria:** All matches have valid pairings, players notified

### Flow 5: Check Live Standings
```
1. Standings tab shows:
   - Big score: "TEAM USA 7 - TEAM EUROPE 5"
   - Visual bar showing point distribution
   - Session breakdown with match results
   - "Points to win: 12.5" indicator
2. Scroll for:
   - Individual leaderboard (points, W-L-H record)
   - Remaining matches
   - "What needs to happen" scenarios
3. Tap any match → Full scorecard
```
**Exit Criteria:** Current standing is crystal clear

### Flow 6: Quick Score Correction
```
1. During match, realize hole 5 was wrong
2. Tap hole 5 in the hole selector
3. Edit buttons appear for that hole
4. Change result → "Undo" saves previous state
5. Score auto-recalculates
6. Toast: "Match updated. Team A now 1 UP"
```
**Exit Criteria:** Mistake fixed without data loss

### Flow 7: End-of-Day Recap
```
1. After final match, Home shows:
   - "Day 1 Complete" banner
   - Day's results summary card
   - Share button → Generates image
2. Standings updated with animation
3. "Tomorrow's Schedule" preview
4. Banter feed shows auto-posts for each match result
```
**Exit Criteria:** Day feels "closed," momentum into tomorrow

### Flow 8: Add a Course Mid-Trip
```
1. From Schedule or More → "Add Course"
2. Course Wizard launches (existing)
3. After save, returns to previous context
4. New course available in tee time selectors
```
**Exit Criteria:** Course usable immediately

### Flow 9: Handle Player No-Show
```
1. Captain opens Matchups → Active session
2. Tap affected match → "Edit Pairing"
3. Remove absent player, select replacement
4. Recalculates handicaps
5. "Update & Republish"
6. Push notification seam (future)
```
**Exit Criteria:** Match can proceed with valid pairing

### Flow 10: Share Final Results
```
1. After final session, Standings shows "Champion" banner
2. "Share Results" CTA
3. Generates:
   - Final score card image
   - Full leaderboard
   - MVP highlight
4. Share sheet for Messages, social, email
```
**Exit Criteria:** Shareable memento of the trip

---

## Failure Modes & Safeguards

| Failure Mode | Safeguard |
|--------------|-----------|
| **Wrong hole scored** | Easy hole navigation, Undo with 5-step history |
| **Wrong player scored** | Always show player avatars + names at top of scoring UI |
| **Forgot to save** | Auto-save every interaction, no "Save" button needed |
| **No cell signal** | 100% offline-first, sync when available (future) |
| **App backgrounded** | State persists, resume exactly where left off |
| **Fat-finger tap** | Confirmation on "Finalize Match", large touch targets |
| **Lost phone mid-round** | Data persisted locally, restore on new device (future iCloud) |
| **Captain makes bad pairing** | Handicap warnings, "Fairness score" indicator |
| **Forgot who won a hole** | Hole-by-hole history visible in match detail |
| **Two people score same match** | Conflict resolution UI (future sync), last-write-wins locally |
| **Player doesn't show** | Captain can edit pairings even after publish (with warning) |
| **Match disputed** | "Request Review" flag (manual resolution) |

---

## Navigation Map (Information Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        TAB BAR                                  │
├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤
│   Home   │ Matchups │  Score   │ Standings│  Teams   │  More   │
└──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘
     │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Trip    │ │ Session │ │ Active  │ │ Overall │ │ Team A  │ │ Banter  │
│ Command │ │ List    │ │ Matches │ │ Score   │ │ Roster  │ │ Feed    │
│ Center  │ │         │ │         │ │         │ │         │ │         │
├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤
│ Next Up │ │ Match   │ │ Score   │ │ Session │ │ Team B  │ │ Photos  │
│ Card    │ │ Cards   │ │ Entry   │ │ Breakdown│ │ Roster  │ │         │
├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤
│ Today   │ │ Pairing │ │ Match   │ │ Player  │ │ Pairing │ │ Players │
│ Schedule│ │ Editor  │ │ Detail  │ │ Stats   │ │ Matrix  │ │         │
├─────────┤ │ (Capt.) │ │         │ │         │ │         │ ├─────────┤
│ Quick   │ │         │ │         │ │         │ │         │ │ Courses │
│ Actions │ │         │ │         │ │         │ │         │ │         │
│         │ │         │ │         │ │         │ │         │ ├─────────┤
│         │ │         │ │         │ │         │ │         │ │ Settings│
└─────────┴─┴─────────┴─┴─────────┴─┴─────────┴─┴─────────┴─┴─────────┘
```

### Tab Descriptions

**Home (Trip Command Center)**
- Hero: "Next Up" card with match details
- Today's timeline
- Captain quick actions (if captain)
- Trip vibe: headline, weather seam, rules

**Matchups**
- List of sessions (Fri AM, Fri PM, Sat AM, etc.)
- Each session shows matches with status
- Captain mode: edit pairings, publish

**Score**
- "Score Now" big CTA
- List of matches with status chips
- Tap to enter scoring mode
- Completed matches with results

**Standings**
- Big team score at top
- Session-by-session breakdown
- Individual player stats
- "Points remaining" calculator

**Teams**
- Team A and Team B pages
- Rosters with handicaps, records
- Captain notes and player tags
- Pairing history matrix

**More**
- Banter feed
- Photo albums
- Players directory
- Courses list
- Settings
- Export options

---

## Screen Wireframes (ASCII)

### Home Tab
```
┌──────────────────────────────────┐
│ 🏆 RYDER CUP 2026               │
│ Monterey Peninsula              │
├──────────────────────────────────┤
│ ┌────────────────────────────┐  │
│ │ ⏰ NEXT UP                  │  │
│ │ 8:30 AM · Fourball         │  │
│ │ Ocean Cliffs Golf Club     │  │
│ │                            │  │
│ │ 👤 You + Mike              │  │
│ │ vs                         │  │
│ │ 👤 Chris + Tom             │  │
│ │                            │  │
│ │ [  Start Scoring  ]        │  │
│ └────────────────────────────┘  │
│                                  │
│ TODAY'S SCHEDULE                │
│ ────────────────                │
│ ⚪ 7:00 AM  Breakfast           │
│ 🔵 8:30 AM  Fourballs (4)       │
│ ⚪ 1:00 PM  Lunch               │
│ 🔵 2:00 PM  Singles (8)         │
│ ⚪ 7:00 PM  Dinner              │
│                                  │
│ ───── CAPTAIN ACTIONS ─────     │
│ [ Set Lineups ] [ Standings ]   │
└──────────────────────────────────┘
```

### Match Scoring Screen
```
┌──────────────────────────────────┐
│ ← Match 2 · Fourball           ×│
├──────────────────────────────────┤
│                                  │
│   🔵 TEAM USA    🔴 TEAM EUR    │
│   J.Smith        C.Brown        │
│   M.Johnson      T.Davis        │
│                                  │
│ ┌────────────────────────────┐  │
│ │    TEAM USA 2 UP           │  │
│ │    through 6 holes         │  │
│ └────────────────────────────┘  │
│                                  │
│          HOLE 7 · Par 4         │
│                                  │
│  ┌────────┐ ┌────────┐ ┌─────┐  │
│  │  +1    │ │ HALVED │ │ +1  │  │
│  │  USA   │ │   ●    │ │ EUR │  │
│  └────────┘ └────────┘ └─────┘  │
│                                  │
│  ○ ○ ● ○ ○ ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○│
│  1 2 3 4 5 6 7 8 9 ...         │
│                                  │
│         [ Undo Last ]           │
└──────────────────────────────────┘
```

### Standings Tab
```
┌──────────────────────────────────┐
│        STANDINGS                │
├──────────────────────────────────┤
│                                  │
│  🔵 TEAM USA      🔴 TEAM EUR   │
│                                  │
│      ████████░░░░               │
│        8.5   ─   5.5            │
│                                  │
│   Points to win: 12.5           │
│                                  │
├──────────────────────────────────┤
│ SESSION BREAKDOWN               │
│ ────────────────                │
│ Fri AM Foursomes    2 - 2      │
│ Fri PM Fourball     3 - 1  ▶   │
│ Sat AM Singles      3.5 - 2.5  │
│ Sat PM Singles      In Progress │
├──────────────────────────────────┤
│ TOP PERFORMERS                  │
│ ────────────────                │
│ 1. J. Smith     3-0-0  3.0 pts │
│ 2. M. Johnson   2-0-1  2.5 pts │
│ 3. C. Brown     2-1-0  2.0 pts │
└──────────────────────────────────┘
```

### Matchups - Session View
```
┌──────────────────────────────────┐
│ ← Friday PM Fourball            │
├──────────────────────────────────┤
│ 4 Matches · 4 Points Available  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ MATCH 1              2:00pm│  │
│ │ Smith/Johnson vs Brown/Davis  │
│ │ 🔵 USA 2 UP (F)            │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ MATCH 2              2:10pm│  │
│ │ Williams/Wilson vs Miller/...│
│ │ ⏳ In Progress (Hole 12)   │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ MATCH 3              2:20pm│  │
│ │ Taylor/... vs .../...      │  │
│ │ ○ Not Started              │  │
│ └────────────────────────────┘  │
│                                  │
│ 👑 [Edit Pairings] (Captain)   │
└──────────────────────────────────┘
```

---

## Component Library Reference

See `/Docs/DesignSystem.md` for:
- Typography scale
- Color tokens
- Spacing system
- Component specs
- Animation guidelines

---

## Accessibility Requirements

### Dynamic Type Support
- All text uses semantic styles (title, headline, body, caption)
- Layout adapts to accessibility sizes
- No truncation of critical information

### Contrast & Color
- Minimum 4.5:1 contrast for body text
- 3:1 for large text and UI components
- Color never sole indicator (icons + text)

### Touch Targets
- Minimum 44pt × 44pt touch targets
- Scoring buttons: 60pt minimum
- Adequate spacing between tappable elements

### VoiceOver
- All interactive elements have labels
- Match status announced clearly
- Haptic feedback mirrors visual feedback

### One-Handed Use
- Critical actions reachable in thumb zone
- No reliance on two-hand gestures
- Pull-to-refresh, swipe to navigate

---

## Delight Checklist

### Microinteractions
- [ ] Button press scale animation (0.95 → 1.0)
- [ ] Score change number animation
- [ ] Match status update with color pulse
- [ ] Hole advance slide animation
- [ ] Points tally increment animation
- [ ] Team win celebration particles

### Haptics
- [ ] Light tap on score button press
- [ ] Medium impact on match finalization
- [ ] Success notification on team point
- [ ] Warning notification on edit locked match

### Quick Actions
- [ ] 3D Touch / Long-press on app icon: "Score Match", "View Standings"
- [ ] Widget showing current standings (future)
- [ ] Lock screen friendly status (future Live Activities)

### Empty States
- [ ] No matches yet: "Your matches will appear here once the captain sets lineups"
- [ ] No scores: "Tap to start scoring your match"
- [ ] No photos: "Photos from your trip will appear here"

### Celebratory Moments
- [ ] Match win: Confetti + team color flash
- [ ] Session win: Trophy badge animation
- [ ] Cup clinch: Full-screen celebration
- [ ] Personal streak: "3 wins in a row!" badge

### Sound (Optional, off by default)
- [ ] Subtle chime on point scored
- [ ] Victory fanfare on cup clinch

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Copilot | Initial UX Spec |
