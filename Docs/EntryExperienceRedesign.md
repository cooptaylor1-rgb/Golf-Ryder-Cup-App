# Entry Experience Redesign

**Date:** January 2026
**Objective:** Transform the home screen from a generic dashboard into a premium command surface

---

## What Changed Structurally

### Before

- Centered hero with trophy icon
- Generic "Your Trips" heading with equal-weight sections
- Flat, full-width panels with no hierarchy
- Symmetrical, predictable layout
- Developer tools (Load Demo / Clear Data) screaming for attention
- Empty state that felt instructional, not inspiring

### After

#### 1. Asymmetric Two-Column Layout (Desktop)

- **Left (60%):** Dominant "Command Card" - the focal point
- **Right (40%):** Secondary, quieter panel for tournament history + dev tools
- **Mobile:** Stacked with clear visual priority

#### 2. Premium Command Card

- Layered backgrounds with depth (gradient overlays, not flat colors)
- Subtle animated glow (Augusta green, slow pulse)
- Inner border for elevated feel
- Live status indicator with pinging dot
- One bold primary action

#### 3. Emotional Empty State

- Headline: "The course awaits" (confident, not instructional)
- Single motivating sentence
- One CTA with breathing glow effect
- Decorative gradient corner element

#### 4. De-emphasized Developer Tools

- Hidden by default under "Developer Tools" accordion
- Whisper-quiet styling (smallest text, muted colors)
- Danger action (Clear Data) requires expansion to see
- No more red buttons competing for attention

---

## Primary vs Secondary Elements

| Element | Priority | Visual Treatment |
|---------|----------|------------------|
| Command Card | **Primary** | Largest, animated, glowing CTA |
| Active Tournament Name | **Primary** | 24-32px bold, white |
| "Continue Scoring" / "Start Tournament" | **Primary** | Solid green button with shadow |
| Recent Tournaments | Secondary | Smaller cards, muted borders |
| Developer Tools | Tertiary | Collapsed by default, tiny text |
| Clear Data | Tertiary | Hidden, no color until hover |

---

## Why This Feels Premium

### 1. Dominant Focal Point

Your eye immediately snaps to the Command Card. There's no question what matters.

### 2. Layered Depth (Palantir-style)

- Multiple gradient layers create visual depth
- Inner borders add subtle dimension
- Animated glow suggests the UI is "alive"

### 3. Restraint in Color (Spotify discipline)

- ONE accent color: Augusta Green
- Used for: status indicator, CTAs, subtle glows
- Everything else is grayscale hierarchy

### 4. Motion with Purpose

- Slow breathing pulse on primary CTA (draws attention without annoying)
- Ping animation on live status dot
- Card entrance animation (500ms, smooth cubic-bezier)

### 5. Typography Hierarchy

- Headlines: Bold, tight tracking, confident
- Body: Calm, smaller, supportive
- Metadata: Tertiary color, smallest size, disappears when not needed

### 6. Dangerous Actions Whisper

- No red "Clear Data" button demanding attention
- Hidden behind accordion
- Only shows subtle red on hover
- Still requires typed confirmation

---

## Technical Implementation

### New CSS Animations

```css
/* Slow pulse for ambient glow */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Command card entrance */
@keyframes command-card-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Layout Structure

```tsx
<div className="grid lg:grid-cols-5 gap-8">
  <div className="lg:col-span-3">  {/* Primary: Command Card */}
  <div className="lg:col-span-2">  {/* Secondary: History + Dev */}
</div>
```

### Visual Depth (Command Card)

```tsx
{/* Base gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-raised to-surface-base" />
{/* Green accent overlay */}
<div className="absolute inset-0 bg-gradient-to-tr from-augusta-green/8 via-transparent to-transparent" />
{/* Animated glow */}
<div className="absolute -top-24 -right-24 w-48 h-48 bg-augusta-green/20 rounded-full blur-3xl animate-pulse-slow" />
{/* Inner border */}
<div className="absolute inset-[1px] rounded-2xl border border-white/5" />
```

---

## Before/After Instructions

### To See Before

```bash
git checkout ffa2df1
```

### To See After

```bash
git checkout main
npm run dev
```

### What to Look For

1. **Empty state:** Does the CTA button breathe? Is the headline confident?
2. **With trips:** Is the primary trip card dominant? Do other trips recede?
3. **Developer tools:** Are they hidden by default? Does "Clear Data" whisper?
4. **Desktop layout:** Is it asymmetric (60/40)? Does the left side dominate?

---

## Quality Benchmark

This screen should not feel out of place next to:

- Spotify's Now Playing card
- Airbnb's empty trip state
- Palantir Foundry's module cards

If it still feels "nice but generic," the mission failed.
