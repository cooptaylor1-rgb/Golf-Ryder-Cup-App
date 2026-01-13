# Release Notes

## v1.2.0 — Friction Killers (Web App) ⚡

**Release Date**: January 2025
**Platform**: Web (Next.js PWA)
**Build**: 1.2.0

---

### 🎯 Overview

The **Friction Killers** release transforms the web app with features that eliminate the most common pain points when setting up and scoring a golf trip. Every feature reduces setup time, improves scoring ergonomics, and celebrates your achievements.

---

### ✨ New Features

#### 🚀 Trip Templates (P2.1)

**Instant Trip Setup**

- 5 pre-configured templates for common formats:
  - **Classic Ryder Cup** — Full 3-day format with foursomes, fourball, and singles
  - **Weekend Warrior** — 2-day format with morning/afternoon sessions
  - **Singles Showdown** — Pure singles matches
  - **Partners Paradise** — All team formats (foursomes + fourball)
  - **9-Hole Pop-Up** — Quick 9-hole sessions
- 3-step wizard: Select → Configure → Preview
- Auto-generates sessions and match slots
- Customizable team names and dates

**Trip Duplication**

- Duplicate any existing trip as a template
- Option to copy players and courses
- Perfect for annual recurring trips

#### 📚 Course Library (P2.2)

**Reusable Course Profiles**

- Save courses from any trip to your library
- Preserves hole pars, handicaps, and tee sets
- Quick-add saved courses to new trips
- Usage tracking to see your most-played courses

**Tee Set Management**

- Multiple tee sets per course
- Stores rating, slope, and color
- Easy selection during match setup

#### ✋ Scoring Ergonomics v2 (P2.3)

**One-Handed Mode**

- Toggle with hand icon in scoring header
- Large, vertically-stacked buttons
- Thumb-friendly placement for right or left hand
- Configurable button sizes: Normal, Large, X-Large

**Always-Visible Undo**

- Option to show undo button at all times
- Clear disabled state when no undo available
- No more hunting for the undo action

**Swipe Navigation**

- Swipe left/right to change holes
- Natural gesture for hole-by-hole scoring
- Can be disabled in settings

**Scoring Settings Page**

- Haptic feedback toggle
- Auto-advance preference
- Match closeout confirmation
- One-handed mode configuration

#### 🏆 Awards & Records (P2.4)

**Automatic Award Computation**

- 8 award categories:
  - 🏆 **MVP** — Most points earned
  - 📊 **Best Record** — Highest win percentage (min 2 matches)
  - 🥇 **Match Winner** — Most individual victories
  - 🤝 **The Diplomat** — Most halved matches
  - 💪 **Dominant Force** — Largest winning margin
  - 🦾 **Iron Man** — Most matches played
  - 🔥 **Streak Master** — Longest winning streak

**Player Leaderboard**

- Sortable by points, wins, or percentage
- Team color indicators
- W-L-H record display

**Trip Records**

- Final score with winner highlight
- Biggest session win tracking
- Shareable awards summary

#### 💾 Backup/Export/Import (P2.5)

**Full Trip Export**

- JSON backup of entire trip
- Includes all matches, scores, courses, players
- Schema versioned for future compatibility
- Automatic filename with date

**Trip Import**

- Import from backup file
- Validates schema before import
- Creates new trip with "(Imported)" suffix
- ID remapping prevents conflicts

**Share Summary**

- One-tap clipboard copy
- Includes standings, leader, and hashtags
- Ready for social media sharing

**Trip Deletion**

- Dangerous zone with confirmation
- Cascading delete of all related data

---

### 🔧 Technical Improvements

#### New Types

- `TripTemplate`, `TemplateSession` — Trip template definitions
- `CourseProfile`, `TeeSetProfile` — Reusable course data
- `ScoringPreferences` — Enhanced scoring UI configuration
- `TripExport`, `ImportResult` — Export/import types
- `Award`, `PlayerStats`, `TripRecords` — Awards system

#### New Services

- `tripTemplateService` — Template creation and duplication
- `courseLibraryService` — Course profile CRUD operations
- `exportImportService` — Trip backup and restore
- `awardsService` — Award computation and leaderboard

#### Database Updates

- Schema v2 with `courseProfiles` and `teeSetProfiles` tables
- Export schema versioning for forward compatibility

#### UI Store Enhancements

- Full `ScoringPreferences` integration
- Preference persistence to localStorage
- Reset to defaults functionality

---

### 📁 Files Added

**Types**

- `src/lib/types/templates.ts`
- `src/lib/types/courseProfile.ts`
- `src/lib/types/scoringPreferences.ts`
- `src/lib/types/export.ts`
- `src/lib/types/awards.ts`

**Services**

- `src/lib/services/tripTemplateService.ts`
- `src/lib/services/courseLibraryService.ts`
- `src/lib/services/exportImportService.ts`
- `src/lib/services/awardsService.ts`

**Pages**

- `src/app/trip/new/page.tsx` — Trip creation wizard
- `src/app/trip/[tripId]/settings/page.tsx` — Trip settings with export
- `src/app/trip/[tripId]/awards/page.tsx` — Awards & leaderboard
- `src/app/settings/scoring/page.tsx` — Scoring preferences
- `src/app/courses/page.tsx` — Course library

**Documentation**

- `Docs/Roadmap.md` — Full P2-P5 product roadmap

---

### 📁 Files Modified

- `src/lib/db/index.ts` — Schema v2 with course profiles
- `src/lib/stores/uiStore.ts` — Enhanced scoring preferences
- `src/app/score/[matchId]/page.tsx` — One-handed mode support

---

### 🐛 Bug Fixes

- None (new features only in this release)

---

### 🔮 Coming Soon (v1.3)

- **P3.1 Social Leaderboard** — Opt-in cross-trip rankings
- **P3.2 Spectator Mode** — Read-only live scoreboard for non-scorers
- **P4.1 Weather Integration** — 7-day forecast for trip location
- **P4.2 Course Data Lookup** — API-based course info autofill

---

### 📋 Migration Notes

The database automatically migrates to schema v2. New `courseProfiles` and `teeSetProfiles` tables are added. Existing scoring preferences are preserved with new defaults for one-handed mode settings.

---

## v1.1.0 — Captain's Toolkit 🎖️

**Release Date**: January 2025
**Minimum iOS**: 17.0
**Build**: TBD

---

### 🎯 Overview

The **Captain's Toolkit** release transforms the Golf Ryder Cup App into the most reliable, delightful, and impossible-to-screw-up trip companion. This major update focuses on three pillars:

1. **Reliability** — Captain Mode prevents accidental edits during live scoring
2. **Efficiency** — Lineup Builder with auto-fill and fairness scoring
3. **Delight** — Magic numbers, countdowns, share cards, and notifications

---

### ✨ New Features

#### 👑 Captain Mode (P0.1)

**Session Locking**

- Lock sessions once pairings are finalized to prevent accidental changes
- Sessions auto-lock when any match begins scoring
- Unlocking requires a 1.5-second hold gesture (prevents drunk-taps!)
- Visual lock badge on all session cards

**Audit Trail**

- Complete log of all critical actions
- Tracks: session locks/unlocks, pairing edits, score changes, lineup publishes
- Filterable by action type
- Captain crown icon in toolbar for quick access

**Session Validation**

- Pre-start validation catches common errors:
  - Duplicate player assignments across matches
  - Players not on either team
  - Empty match slots
- Errors vs warnings distinction

#### 🎯 Lineup Builder (P0.2)

**Drag & Drop Interface**

- Visual player chips with team colors
- Drag players into match slots
- Flow layout for available players pool
- Lock individual matches when finalized

**Auto-Fill Magic**

- One-tap optimal lineup generation
- Considers handicap differences for fair pairings
- Generates format-appropriate pairings:
  - Singles: 1v1 matchups
  - Fourball/Foursomes: Partner pairings

**Fairness Score**

- 0-100 composite score for lineup quality
- Explainable drivers:
  - Handicap spread within teams
  - Overall handicap balance
  - Match competitiveness
- Visual indicator with expandable details

#### 🏠 Command Center Upgrade (P0.3)

**Countdown Timer**

- Live countdown to next tee time
- Format adapts: "2h 15m" → "5m 32s" → "NOW"
- Visual urgency with warning colors

**Magic Number Display**

- Points needed to clinch for each team
- Path to victory insight text
- Updates in real-time as results come in

**Live Matches Section**

- Shows all in-progress matches
- Quick tap to jump to scoring
- Match status and current hole

**Enhanced Captain Actions**

- Session state chips (Locked/Live/Open counts)
- Build Lineup quick action for next session
- Score Now, Standings, Matchups grid
- Contextual subtitles

**Champion Banner**

- Trophy animation when team clinches
- Winner announcement with gold styling

#### 📤 Share & Export (P1.B)

**Standings Share**

- One-tap share of current standings
- Includes scores, leader, magic number
- Formatted with golf emoji and hashtags

**Match Results Share**

- Share individual match outcomes
- Includes session type and result

**Session Results Share**

- Full session breakdown
- Individual match results with status emoji
- Overall standings update

#### 🔔 Local Notifications (P1.D)

**Tee Time Reminders**

- 30-minute and 10-minute pre-session alerts
- Actionable: View Lineup, Snooze
- Per-session scheduling

**Event Notifications**

- Match complete alerts
- Session locked alerts
- Configurable in Settings

**Notification Settings View**

- Authorization prompt handling
- Toggle notification types
- View/manage scheduled notifications
- Test notification (debug builds)

---

### 🔧 Technical Improvements

#### GitHub Actions CI

- Automated build and test on push/PR
- macOS 14 runner with Xcode 15.2
- SPM caching for faster builds
- SwiftLint integration
- Test results artifact upload
- Release build verification on main branch

#### New Services

- `CaptainModeService` — Session locking and validation
- `LineupAutoFillService` — Optimal pairing generation
- `ShareService` — Shareable content generation
- `NotificationService` — Local notification management

#### New Models

- `AuditLogEntry` — Audit trail entries with 15 action types

#### Enhanced Models

- `Trip` — Added captain mode properties, magic number computation
- `RyderCupSession` — Extended with `isLocked` property

---

### 📁 Files Added

**Models**

- `Models/AuditLogEntry.swift`

**Services**

- `Services/CaptainModeService.swift`
- `Services/LineupAutoFillService.swift`
- `Services/ShareService.swift`
- `Services/NotificationService.swift`

**Views**

- `Views/Captain/SessionLockView.swift`
- `Views/Captain/AuditLogView.swift`
- `Views/Lineup/LineupBuilderView.swift`
- `Views/Settings/NotificationSettingsView.swift`

**CI/CD**

- `.github/workflows/ci.yml`

**Documentation**

- `Docs/GapAnalysis.md`
- `ReleaseNotes.md`

---

### 📁 Files Modified

- `Models/Trip.swift` — Captain mode properties
- `GolfTripApp/GolfTripApp.swift` — Schema registration
- `Views/Matchups/MatchupsTabView.swift` — Captain Mode integration
- `Views/Home/HomeTabView.swift` — Command Center upgrade
- `README.md` — What's New section

---

### 🐛 Bug Fixes

- None (new features only in this release)

---

### 🔮 Coming Soon (v1.2)

- **P1.A Side Games** — Nassau, skins, closest-to-pin tracking
- **P1.C Draft Board** — Live snake draft with turn timers
- **P2 Weather Integration** — Real forecast data
- **P2 Photo Attachments** — Link photos to matches
- **P2 Banter Auto-Posts** — Auto-generated match result posts

---

### 📋 Migration Notes

No breaking changes. The new `AuditLogEntry` model is automatically added to the schema. Existing trips will have `isCaptainModeEnabled = false` by default.

---

### 🙏 Credits

Built with ❤️ for golf buddies everywhere.

**Tech Stack**

- SwiftUI + SwiftData
- iOS 17+ with @Observable macro
- UserNotifications framework
- GitHub Actions CI/CD
