# Product Roadmap - Golf Ryder Cup App (Web)

**Last Updated:** January 2026
**Current Version:** v1.1 (Captain's Toolkit)
**Target Version:** v1.2 (Friction Killers)

---

## Executive Summary

This roadmap outlines the path from v1.1 to v2.0, prioritizing features that maximize trip delight without requiring server infrastructure. All P2 features are **offline-first** and ship locally.

---

## Priority Tiers

| Tier | Theme | Timeline | Dependencies |
|------|-------|----------|--------------|
| **P2** | Friction Killers | v1.2 (Jan-Feb 2026) | None |
| **P3** | Social & Spectator | v1.3 (Mar 2026) | Optional sync seam |
| **P4** | External Integrations | v1.4+ (Q2 2026) | API licensing |
| **P5** | Experimental Labs | TBD | User research |

---

## P2 — Friction Killers (v1.2)

### P2.1 Trip Templates + Instant Setup

**User Story:**
As a Captain, I want to create a complete trip in under 60 seconds by selecting a template, so I can focus on inviting players instead of configuring settings.

**Acceptance Criteria:**

- [ ] 5+ templates available: Classic Ryder Cup (3-day), Weekend Warrior (2-day), Singles Night, 9-Hole Pop-Up, Custom
- [ ] One-tap template selection generates sessions, match types, default handicap rules
- [ ] User can review generated structure before finalizing
- [ ] "Duplicate Trip" option copies structure (optionally players, courses)
- [ ] Template-generated trips appear correctly in schedule and standings
- [ ] Duplicated trip has new IDs with no cross-linked references

**Data Model Changes:**

```typescript
interface TripTemplate {
  id: string;
  name: string;
  description: string;
  days: number;
  sessions: TemplateSession[];
  defaultPointsToWin: number;
}

interface TemplateSession {
  dayOffset: number;
  timeSlot: 'AM' | 'PM';
  sessionType: SessionType;
  matchCount: number;
}
```

**UX Notes:**

- New trip flow: Home → "New Trip" → Template Selection → Review → Confirm
- Template cards with visual preview (icons for session types)
- "Duplicate" action in trip settings/more menu

**Risks & Mitigations:**

- Risk: User confusion about what template includes → Mitigation: Preview screen before confirm
- Risk: Template updates break existing trips → Mitigation: Templates are one-time generators, not linked

---

### P2.2 Course Library (Reusable Profiles)

**User Story:**
As a returning user, I want to save course data (pars, handicaps, rating/slope) once and reuse it across trips, so I never re-enter the same course twice.

**Acceptance Criteria:**

- [ ] Course Profiles stored independently from trips
- [ ] Course wizard supports: "Use existing profile", "Save as new profile"
- [ ] Edits in one trip don't mutate other trips unless explicitly updating profile
- [ ] Profile includes: name, location, tee sets (with pars, handicaps, rating, slope)
- [ ] Fast hole handicap grid editor with tap-to-edit
- [ ] Validation catches missing par/handicap before session start

**Data Model Changes:**

```typescript
interface CourseProfile {
  id: UUID;
  name: string;
  location?: string;
  teeSets: TeeSetProfile[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

interface TeeSetProfile {
  id: UUID;
  courseProfileId: UUID;
  name: string;
  color?: string;
  rating: number;
  slope: number;
  par: number;
  holePars: number[];      // 18 elements
  holeHandicaps: number[]; // 18 elements
}
```

**UX Notes:**

- Course library accessible from More tab and course wizard
- "Save to Library" button after creating course in a trip
- Profile picker with search in course wizard

**Risks & Mitigations:**

- Risk: Accidental profile overwrites → Mitigation: Explicit "Update Profile" confirmation
- Risk: Orphaned courses in library → Mitigation: Show usage count, allow cleanup

---

### P2.3 Scoring Ergonomics v2

**User Story:**
As a scorer on the course, I want larger buttons and one-handed controls, so I can score confidently while holding a beer.

**Acceptance Criteria:**

- [ ] One-handed scoring mode toggle in settings
- [ ] Scoring buttons ≥ 60px tap targets in one-handed mode
- [ ] Simplified match layout with essential info only
- [ ] Undo visible at all times (sticky position)
- [ ] Optional "confirm hole" step before advancing
- [ ] "What Now" strip showing: who's away, match state, dormie status
- [ ] All edits logged in existing audit trail

**UX Notes:**

- One-handed mode moves controls to bottom half of screen
- Swipe gestures for quick actions (swipe right = Team A wins hole)
- Haptic feedback on score entry

**Risks & Mitigations:**

- Risk: Mode confusion → Mitigation: Clear indicator when one-handed mode active
- Risk: Accidental swipes → Mitigation: Require deliberate gesture + optional confirm

---

### P2.4 Awards & Records

**User Story:**
As a trip participant, I want automatic awards calculated from match results, so we can celebrate winners without manual tracking.

**Acceptance Criteria:**

- [ ] Awards screen showing: MVP (most points), Best Record, Most Halved, Comeback Kid
- [ ] Trip Records: largest margin win, best session performance
- [ ] Awards computed deterministically from completed matches
- [ ] Works with partially completed trips (shows "so far" qualifier)
- [ ] Shareable awards cards

**Data Model Changes:**

```typescript
interface Award {
  type: AwardType;
  playerId: UUID;
  playerName: string;
  value: string; // "3.5 points", "4-1-1 record"
  tripId: UUID;
}

type AwardType =
  | 'mvp'
  | 'bestRecord'
  | 'mostHalved'
  | 'comebackKid'
  | 'ironman'      // most matches played
  | 'clutch';      // won deciding match
```

**UX Notes:**

- Awards tab in standings or dedicated screen
- Trophy icons and celebration animations
- "Share Awards" generates image card

---

### P2.5 Backup / Export / Import

**User Story:**
As a Captain, I want to export my trip data to a file, so I never lose historical trip records.

**Acceptance Criteria:**

- [ ] Export trip to JSON file with all data (settings, players, teams, matches, scores)
- [ ] Import creates NEW trip (no ID collisions)
- [ ] Export/import round-trips correctly
- [ ] Schema version field (v1) for future compatibility
- [ ] "Trip Snapshot" text summary shareable

**Data Model Changes:**

```typescript
interface TripExport {
  schemaVersion: 1;
  exportedAt: ISODateString;
  trip: Trip;
  players: Player[];
  teams: Team[];
  teamMembers: TeamMember[];
  sessions: RyderCupSession[];
  matches: Match[];
  holeResults: HoleResult[];
  courses: Course[];
  teeSets: TeeSet[];
}
```

**UX Notes:**

- Export button in More tab under trip settings
- Import option on home screen (or More tab)
- Progress indicator for large exports

**Risks & Mitigations:**

- Risk: Import fails mid-way → Mitigation: Transaction-based import, rollback on error
- Risk: Large file sizes → Mitigation: Compress JSON, exclude optional fields

---

## P3 — Social & Spectator (v1.3)

### P3.1 Shared Trip (iCloud/CloudKit) — DESIGN ONLY in v1.2

**Status:** Design document only, implementation deferred

**Design Document:** See `Docs/SyncDesign.md`

**Key Decisions Needed:**

- Ownership model (Captain owns schedule/pairings)
- Scorer permissions
- Conflict resolution (last-write-wins vs merge)
- Data model impact

---

### P3.2 Spectator Mode

**User Story:**
As a non-playing friend, I want a read-only scoreboard view, so I can follow along without risking accidental edits.

**Acceptance Criteria:**

- [ ] Dedicated "Spectator" route with zero edit controls
- [ ] Large scoreboard showing team standings
- [ ] Live match tiles with current scores
- [ ] Today's sessions with status
- [ ] Works on iPad/desktop (responsive)

**UX Notes:**

- Entry via share link or toggle in app
- No authentication required for local spectator
- Great for displaying on TV/iPad at clubhouse

---

## P4 — External Integrations (v1.4+)

### P4.1 GHIN Handicap Import

**User Story:**
As a Captain, I want to import handicap indexes from GHIN automatically, so I don't have to ask players for their numbers.

**Status:** Requires GHIN API license research

**Dependencies:**

- GHIN API access agreement
- Player GHIN number storage

---

### P4.2 Course Database (Golf Genius/GolfNow)

**User Story:**
As a Captain, I want to search a database for course info instead of entering it manually.

**Status:** Requires API partnership

---

### P4.3 Weather Integration

**User Story:**
As a Captain, I want to see weather forecasts for tee times on the schedule.

**Status:** API key required, can use free tier

---

## P5 — Experimental Labs (TBD)

### P5.1 AI Lineup Suggestions

**Concept:** Use ML to suggest optimal pairings based on historical performance

### P5.2 Live Photo Stream

**Concept:** Real-time photo sharing during rounds

### P5.3 Voice Scoring

**Concept:** "Hey Caddie, Team USA wins hole 7"

---

## Recommended Ship Order (v1.2)

1. **P2.1 Trip Templates** — Highest impact for new users
2. **P2.5 Backup/Export** — Safety net before other changes
3. **P2.2 Course Library** — Reduces repeat friction
4. **P2.3 Scoring Ergonomics** — Improves core flow
5. **P2.4 Awards** — Delight feature
6. **P3.2 Spectator Mode** — If time permits

---

## De-scope List (NOT in v1.2)

- ❌ CloudKit sync (P3.1) — Design only, no implementation
- ❌ GHIN integration (P4.1) — Licensing dependent
- ❌ Course database APIs (P4.2) — Partnership dependent
- ❌ Weather API (P4.3) — Can add later, not critical
- ❌ AI suggestions (P5.1) — Research phase
- ❌ PDF export — Nice-to-have, not critical
- ❌ Push notifications — Requires server

---

## Success Metrics

| Feature | Success Metric |
|---------|----------------|
| Trip Templates | 80% of new trips use template |
| Course Library | 50% course reuse rate |
| Backup/Export | <5% data loss reports |
| Scoring Ergonomics | Reduced mis-taps by 50% |
| Awards | 90% of trips view awards |

---

## Next Review

Schedule roadmap review after v1.2 ships (target: February 2026)
