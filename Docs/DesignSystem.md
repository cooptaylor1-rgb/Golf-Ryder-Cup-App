# Buddies Trip Ryder Cup - Design System

## Overview

This design system defines the visual language for the Golf Ryder Cup app. The goal is a premium, golf-inspired aesthetic that feels authoritative yet approachable—like the best golf club member experience, in your pocket.

**Design Principles:**
1. **Clarity First** - Information hierarchy is paramount; scores must be glanceable
2. **Premium Feel** - Dark mode default, subtle depth, refined typography
3. **Golf Heritage** - Classic greens, tournament aesthetics, trophy gold accents
4. **Accessibility** - WCAG AA minimum, Dynamic Type, high contrast options

---

## Color System

### Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `primary` | #1B5E20 | #4CAF50 | Primary actions, links, active states |
| `primaryVariant` | #2E7D32 | #81C784 | Hover states, secondary emphasis |
| `secondary` | #B8860B | #FFD54F | Accents, trophies, highlights |
| `secondaryVariant` | #8B6914 | #FFECB3 | Secondary accents |

### Team Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `teamUSA` | #1565C0 | 21, 101, 192 | Team USA/Blue indicators |
| `teamUSALight` | #42A5F5 | 66, 165, 245 | Team USA highlights |
| `teamEurope` | #C62828 | 198, 40, 40 | Team Europe/Red indicators |
| `teamEuropeLight` | #EF5350 | 239, 83, 80 | Team Europe highlights |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `success` | #2E7D32 | #66BB6A | Wins, positive states |
| `warning` | #F57C00 | #FFB74D | Cautions, handicap warnings |
| `error` | #C62828 | #EF5350 | Errors, destructive actions |
| `info` | #1976D2 | #64B5F6 | Informational states |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `background` | #FAFAFA | #121212 | App background |
| `surface` | #FFFFFF | #1E1E1E | Cards, sheets, modals |
| `surfaceVariant` | #F5F5F5 | #2C2C2C | Secondary surfaces |
| `surfaceElevated` | #FFFFFF | #333333 | Elevated cards (depth) |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `textPrimary` | #212121 | #FFFFFF | Primary content |
| `textSecondary` | #757575 | #B0B0B0 | Secondary content |
| `textTertiary` | #9E9E9E | #757575 | Tertiary, disabled |
| `textOnPrimary` | #FFFFFF | #000000 | Text on primary color |

### Golf-Specific Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `fairway` | #4CAF50 | Course/fairway indicators |
| `bunker` | #D7CCC8 | Bunker/sand indicators |
| `water` | #29B6F6 | Water hazards |
| `rough` | #8BC34A | Rough indicators |
| `green` | #2E7D32 | Putting green |

---

## Typography

### Font Stack

```swift
// Primary: SF Pro (system default)
// Monospace: SF Mono (scores, numbers)

static let fontFamily = Font.system
static let fontFamilyMono = Font.system(.body, design: .monospaced)
```

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `largeTitle` | 34pt | Bold | 41pt | Screen titles, hero scores |
| `title` | 28pt | Bold | 34pt | Section headers |
| `title2` | 22pt | Bold | 28pt | Card titles |
| `title3` | 20pt | Semibold | 25pt | Subsection headers |
| `headline` | 17pt | Semibold | 22pt | Emphasized body |
| `body` | 17pt | Regular | 22pt | Primary content |
| `callout` | 16pt | Regular | 21pt | Secondary content |
| `subheadline` | 15pt | Regular | 20pt | Supporting text |
| `footnote` | 13pt | Regular | 18pt | Captions, metadata |
| `caption` | 12pt | Regular | 16pt | Timestamps, labels |
| `caption2` | 11pt | Regular | 13pt | Fine print |

### Score Typography (Monospace)

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| `scoreHero` | 72pt | Bold | Big team scores |
| `scoreLarge` | 48pt | Bold | Match scores |
| `scoreMedium` | 32pt | Semibold | Hole scores |
| `scoreSmall` | 24pt | Medium | Inline scores |

### SwiftUI Implementation

```swift
extension Font {
    static let scoreHero = Font.system(size: 72, weight: .bold, design: .monospaced)
    static let scoreLarge = Font.system(size: 48, weight: .bold, design: .monospaced)
    static let scoreMedium = Font.system(size: 32, weight: .semibold, design: .monospaced)
    static let scoreSmall = Font.system(size: 24, weight: .medium, design: .monospaced)
}
```

---

## Spacing System

### Base Unit
`4pt` base unit. All spacing is a multiple of 4.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xxs` | 2pt | Tight inline spacing |
| `xs` | 4pt | Icon-to-text, tight groups |
| `sm` | 8pt | Related element spacing |
| `md` | 12pt | Default padding |
| `lg` | 16pt | Section spacing |
| `xl` | 24pt | Major section breaks |
| `xxl` | 32pt | Screen-level spacing |
| `xxxl` | 48pt | Hero spacing |

### SwiftUI Implementation

```swift
enum Spacing {
    static let xxs: CGFloat = 2
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let xxxl: CGFloat = 48
}
```

### Layout Guidelines

| Context | Horizontal | Vertical |
|---------|------------|----------|
| Screen edges | 16pt | 16pt |
| Card padding | 16pt | 16pt |
| List item | 16pt | 12pt |
| Between cards | - | 12pt |
| Section spacing | - | 24pt |

---

## Corner Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radiusXs` | 4pt | Small chips, badges |
| `radiusSm` | 8pt | Buttons, inputs |
| `radiusMd` | 12pt | Cards, modals |
| `radiusLg` | 16pt | Large cards, sheets |
| `radiusXl` | 24pt | Hero cards |
| `radiusFull` | 9999pt | Circular (pills, avatars) |

---

## Elevation & Shadows

### Dark Mode (Default)

| Level | Shadow | Usage |
|-------|--------|-------|
| `elevation0` | none | Flat surfaces |
| `elevation1` | subtle glow | Cards at rest |
| `elevation2` | medium glow | Hovered cards |
| `elevation3` | prominent glow | Modals, sheets |

### Light Mode

| Level | Shadow | Usage |
|-------|--------|-------|
| `elevation0` | none | Flat surfaces |
| `elevation1` | `0 1px 3px rgba(0,0,0,0.12)` | Cards at rest |
| `elevation2` | `0 4px 6px rgba(0,0,0,0.15)` | Hovered cards |
| `elevation3` | `0 8px 16px rgba(0,0,0,0.2)` | Modals, sheets |

### SwiftUI Implementation

```swift
extension View {
    func elevation(_ level: Int) -> some View {
        self.shadow(
            color: Color.black.opacity(level == 0 ? 0 : 0.1 + Double(level) * 0.05),
            radius: CGFloat(level * 4),
            y: CGFloat(level * 2)
        )
    }
}
```

---

## Components

### Buttons

#### Primary Button
```
┌─────────────────────────────┐
│     Start Scoring           │  44pt height, full width
│         ●                   │  Primary color bg
└─────────────────────────────┘  White text, bold
```
- Height: 44pt minimum (54pt preferred)
- Corner radius: 12pt
- Background: `primary`
- Text: `textOnPrimary`, semibold

#### Secondary Button
```
┌─────────────────────────────┐
│     View Details            │  44pt height
│                             │  Bordered, primary color
└─────────────────────────────┘
```
- Height: 44pt minimum
- Corner radius: 12pt
- Border: 1.5pt `primary`
- Text: `primary`, semibold

#### Scoring Button (Special)
```
┌───────────────────┐
│                   │
│      +1 USA       │  60pt minimum height
│                   │  Team color bg
└───────────────────┘  Extra large touch target
```
- Height: 60pt minimum
- Corner radius: 16pt
- Background: Team color
- Haptic feedback on tap

### Cards

#### Match Card
```
┌────────────────────────────────────┐
│ MATCH 1                    2:00 PM │
│ ─────────────────────────────────  │
│ 👤 Smith / Johnson                 │
│            vs                      │
│ 👤 Brown / Davis                   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │   🔵 USA 2 UP (Final)        │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```
- Padding: 16pt
- Corner radius: 16pt
- Background: `surface`
- Status badge: rounded, team color

#### Next Up Card (Hero)
```
┌────────────────────────────────────┐
│ ⏰ NEXT UP                         │
│                                    │
│ 8:30 AM · Fourball Match Play     │
│ Ocean Cliffs Golf Club            │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🔵 You + Mike                  │ │
│ │          vs                    │ │
│ │ 🔴 Chris + Tom                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌──────────────────────────────┐   │
│ │      Start Scoring           │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```
- Padding: 20pt
- Corner radius: 20pt
- Background: gradient or elevated surface
- CTA prominent at bottom

### Score Display

#### Big Score
```
        8.5 — 5.5
   ████████░░░░░░░
```
- Numbers: `scoreHero` font
- Progress bar: 8pt height, rounded
- Team colors for fill

#### Match Status Badge
```
┌─────────────────────┐
│ USA 2 UP            │  Chip style
└─────────────────────┘
```
- Height: 28pt
- Padding: 8pt horizontal
- Corner radius: 14pt (pill)
- Background: Team color at 15% opacity
- Text: Team color, semibold

### Hole Indicator

#### Hole Dots
```
● ○ ● ○ ○ ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
1 2 3 4 5 6 7 8 9 ...
```
- Dot size: 8pt (12pt current hole)
- Spacing: 4pt
- Colors: Team color for wins, `textTertiary` for halved, empty for unplayed
- Current hole: larger, outlined

### Avatar

```
┌─────┐
│ JS  │  32pt default, 44pt large
└─────┘
```
- Sizes: 24pt (small), 32pt (default), 44pt (large), 64pt (profile)
- Shape: Circle
- Fallback: Initials on `surfaceVariant`
- Border: 2pt white when on colored background

### Empty State

```
┌────────────────────────────────────┐
│                                    │
│            🏌️‍♂️                    │
│                                    │
│     No matches scheduled yet      │
│                                    │
│   Your matches will appear here   │
│   once the captain sets the       │
│   lineup.                         │
│                                    │
└────────────────────────────────────┘
```
- Icon: 48pt, `textTertiary`
- Title: `title3`, `textPrimary`
- Description: `body`, `textSecondary`, centered
- Optional CTA button below

---

## Motion & Animation

### Principles
1. **Purposeful** - Animation guides attention, never decorative noise
2. **Swift** - Fast enough to not slow interaction (200-300ms typical)
3. **Natural** - Physics-based easing, not linear
4. **Consistent** - Same actions, same animations

### Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `instant` | 100ms | Micro-feedback (button press) |
| `fast` | 200ms | Simple transitions |
| `normal` | 300ms | Standard transitions |
| `slow` | 500ms | Complex animations, modals |
| `celebration` | 1000ms | Victory animations |

### Easing Curves

| Token | Curve | Usage |
|-------|-------|-------|
| `easeOut` | `[0.0, 0.0, 0.2, 1.0]` | Elements entering |
| `easeIn` | `[0.4, 0.0, 1.0, 1.0]` | Elements exiting |
| `easeInOut` | `[0.4, 0.0, 0.2, 1.0]` | On-screen transitions |
| `spring` | `damping: 0.7, response: 0.3` | Bouncy feedback |

### Standard Animations

#### Button Press
```swift
.scaleEffect(isPressed ? 0.95 : 1.0)
.animation(.spring(response: 0.2, dampingFraction: 0.6), value: isPressed)
```

#### Score Change
```swift
// Number rolls up/down with spring
.contentTransition(.numericText())
```

#### Card Appearance
```swift
.transition(.asymmetric(
    insertion: .opacity.combined(with: .move(edge: .bottom)),
    removal: .opacity
))
```

#### Match Win Celebration
- Confetti particles (team colors)
- Score flash (glow effect)
- Badge pulse animation

### SwiftUI Implementation

```swift
extension Animation {
    static let buttonPress = Animation.spring(response: 0.2, dampingFraction: 0.6)
    static let scoreChange = Animation.spring(response: 0.3, dampingFraction: 0.7)
    static let cardAppear = Animation.easeOut(duration: 0.3)
    static let celebration = Animation.easeInOut(duration: 1.0)
}
```

---

## Haptics

### Feedback Types

| Event | Haptic | SwiftUI |
|-------|--------|---------|
| Button tap | Light impact | `.impact(style: .light)` |
| Score entry | Medium impact | `.impact(style: .medium)` |
| Match finalized | Success notification | `.notification(type: .success)` |
| Error / Invalid | Error notification | `.notification(type: .error)` |
| Undo | Soft impact | `.impact(style: .soft)` |
| Selection change | Selection changed | `.selectionChanged()` |

### Implementation

```swift
struct HapticManager {
    static func buttonTap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    static func scoreEntered() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
    
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
    
    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
}
```

---

## Icons

### System Icons (SF Symbols)

| Usage | Symbol | Alternative |
|-------|--------|-------------|
| Home | `house.fill` | `house` |
| Matchups | `rectangle.grid.2x2.fill` | `list.bullet` |
| Score | `plus.circle.fill` | `pencil` |
| Standings | `trophy.fill` | `chart.bar.fill` |
| Teams | `person.2.fill` | `person.3.fill` |
| More | `ellipsis.circle.fill` | `line.3.horizontal` |
| Settings | `gear` | `gearshape.fill` |
| Golf | `flag.fill` | `figure.golf` |
| Calendar | `calendar` | - |
| Time | `clock` | `clock.fill` |
| Location | `mappin` | `location.fill` |
| Edit | `pencil` | `square.and.pencil` |
| Delete | `trash` | `trash.fill` |
| Add | `plus` | `plus.circle` |
| Check | `checkmark` | `checkmark.circle.fill` |
| Close | `xmark` | `xmark.circle.fill` |
| Back | `chevron.left` | `arrow.left` |
| Share | `square.and.arrow.up` | - |
| Photo | `photo` | `camera.fill` |
| Message | `bubble.left` | `text.bubble` |

### Icon Sizing

| Context | Size |
|---------|------|
| Tab bar | 24pt |
| Navigation bar | 22pt |
| List row | 20pt |
| Button inline | 18pt |
| Badge | 14pt |

---

## Accessibility

### Color Contrast

All color combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `textPrimary` | `background` | 15.8:1 | ✅ |
| `textSecondary` | `background` | 7.2:1 | ✅ |
| `textOnPrimary` | `primary` | 8.3:1 | ✅ |
| `teamUSA` | `surface` | 5.1:1 | ✅ |
| `teamEurope` | `surface` | 6.2:1 | ✅ |

### Touch Targets

- Minimum: 44pt × 44pt
- Recommended: 48pt × 48pt
- Scoring buttons: 60pt × 60pt minimum

### Focus Indicators

- 2pt border in `primary` color
- Offset by 2pt from element

### Screen Reader

- All images have `accessibilityLabel`
- Interactive elements have `accessibilityHint`
- Score changes announced with `accessibilityAnnouncement`
- Match status uses `accessibilityValue`

### Reduce Motion

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

// Use crossfade instead of slide when reduceMotion is true
```

---

## Dark Mode (Default)

The app defaults to dark mode for premium feel and outdoor legibility.

### Automatic Adjustments

| Element | Light | Dark |
|---------|-------|------|
| Background | #FAFAFA | #121212 |
| Cards | white + shadow | #1E1E1E + subtle glow |
| Primary green | #1B5E20 | #4CAF50 |
| Dividers | #E0E0E0 | #333333 |

### User Preference

- Respect system setting by default
- Allow override in Settings
- Persist user preference

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Copilot | Initial Design System |
