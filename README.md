# Golf Trip App

A production-grade iOS mobile app for managing golf trips, built with SwiftUI and SwiftData. The app supports player profiles with USGA Handicap Index, course management, trip scheduling, team competitions, and comprehensive scoring with leaderboards.

## Features

### Player Profiles
- Create/edit/delete players with full profile information
- USGA Handicap Index (decimal precision)
- Optional GHIN number for future integration
- Tee preference (Blue/White/etc.)
- Avatar photo support
- Player list with search and sort (by name or handicap)
- Course handicap preview for different course difficulties

### Courses
- Create/edit/delete courses
- Multiple tee sets per course with:
  - Rating and Slope
  - Par and total yardage
  - **Hole handicaps (1-18)** - Required for proper stroke allocation
  - Hole pars
- Course detail screen with complete hole handicap table

### Trip & Schedule
- Create trips with name, dates, location, and notes
- Day-by-day schedule view
- Schedule items:
  - **Tee Times** - linked to course/tee set, with player groups
  - **Events** - dinners, travel, activities
- Groups for tee times with player assignments
- Quick navigation to upcoming events

### Teams
- Dedicated Teams tab for trip-based team management
- Two team modes:
  - **Freeform Teams** - any number of teams, flexible roster sizes
  - **Ryder Cup Sides** - exactly 2 teams with roster validation
- Team color selection
- Captain designation
- Drag-to-reorder roster
- Teams reusable across multiple tee times

### Formats & Scoring
- Multiple game formats:
  - Individual Stroke Play (Gross)
  - Individual Stroke Play (Net)
  - Stableford (Net Points)
  - 2-Person Best Ball (Net)
  - 4-Person Scramble

- Scoring features:
  - Per-hole score entry with large tap targets
  - Visual strokes-received indicators (orange dots)
  - Auto-calculated totals and net scores
  - Real-time gross/net/points display
  - Full scorecard summary view

### Event Scoring Tab
- Upcoming tee times requiring scores
- In-progress scorecards
- Completed scorecards with results
- Leaderboards with aggregation options:
  - Single Event
  - Day Totals
  - Trip Totals

## How to Run

### Requirements
- macOS with Xcode 15.0+
- iOS 17.0+ deployment target
- Swift 5.9+

### Steps
1. Open `GolfTripApp/GolfTripApp.xcodeproj` in Xcode
2. Select a simulator or connected device (iOS 17+)
3. Build and run (⌘R)

The app automatically seeds sample data on first launch:
- 8 sample players with various handicaps
- 3 courses with tee sets and hole handicaps
- A sample trip with schedule
- Two teams in Ryder Cup mode

## Architecture Overview

### Pattern: MVVM with SwiftData
The app uses a clean MVVM architecture with SwiftData for persistence:

```
GolfTripApp/
├── GolfTripApp.swift          # App entry point, ModelContainer setup
├── Models/                     # SwiftData @Model entities
│   ├── Player.swift
│   ├── Course.swift
│   ├── TeeSet.swift
│   ├── Trip.swift
│   ├── ScheduleDay.swift
│   ├── ScheduleItem.swift
│   ├── Team.swift
│   ├── TeamMember.swift
│   ├── Group.swift
│   ├── GroupPlayer.swift
│   ├── Format.swift
│   ├── Scorecard.swift
│   ├── HoleScore.swift
│   └── TeamScore.swift
├── Views/                      # SwiftUI views organized by feature
│   ├── ContentView.swift       # Main tab navigation
│   ├── Player/                 # Player CRUD views
│   ├── Course/                 # Course and TeeSet views
│   ├── Trip/                   # Trip, Schedule, Groups views
│   ├── Teams/                  # Team management views
│   ├── Scoring/                # Scorecard, entry, results views
│   └── Settings/               # Settings and data management
├── Services/
│   ├── HandicapCalculator.swift  # Core handicap logic
│   └── SeedDataService.swift     # Sample data generation
└── Extensions/
    └── Color+Hex.swift           # Hex color support
```

### Data Model
```
Player ──┬── TeamMember ──── Team ──── Trip
         │                              │
         └── GroupPlayer ── Group ── ScheduleItem ── ScheduleDay
                                     │
                                     └── Scorecard ── HoleScore
                                              │
                                              └── Format
```

### Offline-First
- All data persisted locally with SwiftData
- No network dependency for MVP
- Designed for future iCloud sync (seams in place)

## Handicap Logic

### Location
`GolfTripApp/Services/HandicapCalculator.swift`

### Course Handicap Formula
```swift
CourseHandicap = round(HandicapIndex × (Slope ÷ 113) + (CourseRating - Par))
```

### Strokes Allocation
- Each hole gets `floor(CourseHandicap / 18)` base strokes
- Extra strokes (`CourseHandicap % 18`) go to hardest holes
- Hardest holes = lowest hole handicap numbers (1 is hardest)
- Negative handicaps (plus-handicaps): subtract strokes from hardest holes

### Stableford Points (Net)
| Net Score vs Par | Points |
|------------------|--------|
| Albatross or better | 5 |
| Eagle | 4 |
| Birdie | 3 |
| Par | 2 |
| Bogey | 1 |
| Double+ | 0 |

### Testing
Unit tests in `Tests/HandicapCalculatorTests.swift`:
- Course handicap calculations (various slopes/ratings)
- Strokes allocation (0, 18, 36 handicaps, plus-handicaps)
- Stableford points for all scoring scenarios
- Best ball team calculations
- Full round integration tests

## Teams & Event Scoring Model

### Teams
- **Team** entity with `mode` (freeform/ryderCup)
- **TeamMember** links players to teams with captain flag
- Teams scoped to trips for reuse across events
- Ryder Cup mode validates equal roster sizes

### Event Scoring
- **Scorecard** tracks status (draft/inProgress/final)
- **HoleScore** stores per-hole strokes per player/team
- **Format** defines game type and options
- Aggregation computed at runtime from completed scorecards

## Product Backlog (Future Features)

### High Priority
- [ ] Ryder Cup session scoring (match play format)
- [ ] Skins game tracking
- [ ] Nassau (front/back/total) betting
- [ ] Side games (closest to pin, long drive)

### Medium Priority
- [ ] iCloud sync across devices
- [ ] Live sharing (multiple phones scoring same round)
- [ ] Import handicaps from GHIN API
- [ ] Team vs Team match play scoring

### Lower Priority
- [ ] Push notifications for tee times
- [ ] PDF export / share leaderboard screenshot
- [ ] Apple Watch companion for quick scoring
- [ ] Course GPS integration
- [ ] Weather integration

## License

MIT License - Free to use and modify
