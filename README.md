# 🏆 The Ryder Cup Companion — Web App

**The best-in-class web app for buddies trip Ryder Cup tournaments.**

A mobile-first Progressive Web App (PWA) for running competitive golf trips. Features match play scoring, team management, live standings, and a "Trip Command Center" that makes organizing your golf weekend legendary.

**Works 100% offline. Score with one hand. Never lose your data.**

![Build](https://github.com/cooptaylor1-rgb/Golf-Ryder-Cup-App/actions/workflows/ci.yml/badge.svg)

---

## 🆕 What's New in v1.2 — Friction Killers

### 🚀 Trip Templates

- **5 pre-built formats**: Classic Ryder Cup, Weekend Warrior, Singles Showdown, Partners Paradise, 9-Hole Pop-Up
- Create a complete trip in under 60 seconds
- Duplicate existing trips for annual events

### 📚 Course Library

- Save courses once, reuse across trips
- Stores hole pars, handicaps, rating/slope
- Quick-add from library when setting up matches

### ✋ One-Handed Scoring Mode

- Large, thumb-friendly buttons
- Swipe navigation between holes
- Configurable for left or right hand

### 🏆 Awards & Records

- Automatic MVP, Best Record, Match Winner
- Streak tracking and dominant performances
- Shareable awards summary

### 💾 Backup/Export/Import

- Export full trip to JSON file
- Import backups as new trips
- Never lose your tournament data

---

## ✨ Features

### 🎯 Match Play Scoring

- **Big tap targets** — Easy scoring, even after drinks
- **Live status** — "Team A 2 UP with 5 to play"
- **Auto-detection** — Dormie, closeout, final results
- **Undo support** — Revert mistakes in one tap
- **Haptic feedback** — Feel every score entry

### 🎯 Sessions & Formats

| Format | Description |
|--------|-------------|
| **Singles** | 1v1 match play |
| **Fourball** | Best ball (2v2) |
| **Foursomes** | Alternate shot (2v2) |

### 📊 Handicap Allowances

- **Singles**: 100% of course handicap difference
- **Fourball**: 90% off lowest handicap
- **Foursomes**: 50% of combined team handicap

### 🏅 Standings & Leaderboard

- Live team scores with session breakdown
- Individual player records (W-L-H)
- Magic number (points to clinch)
- Performance badges

### 👑 Captain Features

- **Session locking** — Prevent accidental edits
- **Lineup builder** — Drag-and-drop pairings
- **Auto-fill** — Optimal lineups by handicap
- **Fairness score** — Ensure balanced matchups
- **Audit log** — Track all changes

### 📱 Offline-First PWA

- Install on any device (iOS, Android, Desktop)
- Works without internet connection
- All data stored locally in IndexedDB
- Survives page refresh and app restart

---

## 🚀 Quick Start

### Installation

**Option A: Use hosted version**

```
https://your-deployment-url.com
```

**Option B: Run locally**

```bash
cd golf-ryder-cup-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Add to Home Screen

1. Open the app in Chrome/Safari
2. Tap the menu (⋮ or share icon)
3. Select **"Add to Home Screen"**
4. Launch from your home screen

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](Docs/UserGuide.md) | Captain's quick start guide |
| [Roadmap](Docs/Roadmap.md) | P2-P5 feature roadmap |
| [Design System](Docs/DesignSystem.md) | UI/UX specifications |
| [Tech Debt](Docs/TechDebt.md) | Known issues and fixes |
| [Release Notes](ReleaseNotes.md) | Version history |
| [Sync Design](Docs/SyncDesign.md) | Future multi-device sync architecture |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Storage** | Dexie.js (IndexedDB) |
| **PWA** | next-pwa |
| **Icons** | Lucide React |
| **Build** | Turbopack |

### Project Structure

```
golf-ryder-cup-web/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── courses/      # Course library
│   │   ├── matchups/     # Session management
│   │   ├── players/      # Player management
│   │   ├── score/        # Live scoring
│   │   ├── settings/     # App settings
│   │   ├── standings/    # Leaderboard
│   │   └── trip/         # Trip management
│   ├── components/       # Reusable UI components
│   └── lib/
│       ├── db/           # Dexie IndexedDB schema
│       ├── services/     # Business logic
│       ├── stores/       # Zustand state
│       ├── types/        # TypeScript interfaces
│       └── utils/        # Helpers
├── public/               # Static assets + PWA manifest
└── Docs/                 # Documentation
```

---

## 🧪 Development

### Commands

```bash
# Development server (with Turbopack)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

### Environment

- Node.js 18+
- npm 9+

---

## 🎨 Design System

Augusta National-inspired premium design:

### Colors

- **Team USA**: Blue (#1565C0)
- **Team Europe**: Red (#C62828)
- **Primary**: Augusta Green (#006747)
- **Accent**: Championship Gold (#FFD700)

### Typography

- Score displays: Monospace, large sizes
- Body text: System fonts for readability

### Principles

- **Mobile-first** — Touch-friendly targets (44px+)
- **Sunlight-friendly** — High contrast mode
- **One-handed** — Reachable controls
- **Offline-first** — Never block on network

---

## 📋 Roadmap

| Version | Theme | Status |
|---------|-------|--------|
| v1.1 | Captain's Toolkit | ✅ Shipped |
| v1.2 | Friction Killers | ✅ Shipped |
| v1.3 | Social & Spectator | 🔜 Planned |
| v1.4 | External Integrations | 📋 Backlog |
| v2.0 | Multi-Device Sync | 📋 Backlog |

See [Roadmap.md](Docs/Roadmap.md) for detailed feature specs.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## 📄 License

MIT License — Free to use and modify.

---

## 🏌️ About

Built for the golf buddies who want to run a legendary Ryder Cup–style tournament without spreadsheets, group chat chaos, or lost scorecards.

**May your team clinch the cup! 🏆⛳**
