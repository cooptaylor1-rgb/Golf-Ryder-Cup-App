# Testing Documentation

This document describes the comprehensive testing infrastructure for the Golf Ryder Cup App.

## Overview

The testing system is designed to approximate **"1000 users using the app for a few months"** through a combination of:

1. **Deterministic E2E journey tests** - Core user workflows
2. **Chaos/network failure tests** - Offline, latency, and error handling
3. **Fuzz/monkey testing** - Random but valid UI actions with reproducible seeds
4. **Large-scale simulation** - Combined test runs across multiple seeds

## Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run smoke tests (fast, critical paths)
npm run test:smoke

# Run regression tests (comprehensive)
npm run test:regression

# Run nightly tests (includes chaos, large datasets)
npm run test:nightly
```

## Test Organization

```
tests/e2e/
├── journeys/           # User workflow tests (Phases 1-12)
│   ├── captain-flows.spec.ts
│   └── participant-flows.spec.ts
├── chaos/              # Network failure simulation
│   └── network-chaos.spec.ts
├── fuzz/               # Monkey testing
│   └── monkey-testing.spec.ts
├── fixtures/           # Playwright test fixtures
│   └── test-fixtures.ts
├── utils/              # Test utilities
│   ├── test-helpers.ts
│   └── seeder.ts
└── artifacts/          # Test outputs (gitignored)
    ├── html-report/
    ├── test-results/
    └── simulate-1000/

e2e/                    # Legacy tests (still supported)
├── qa-simulation.spec.ts
├── captain-mode.spec.ts
└── ...

scripts/testing/
├── seed-small.ts       # Generate small dataset
├── seed-large.ts       # Generate large dataset
└── simulate-1000.ts    # Full simulation runner
```

## Test Types

### Journey Tests (`tests/e2e/journeys/`)

User workflow tests covering the core application functionality:

| Journey | Description | Tag |
|---------|-------------|-----|
| 1 | Create Trip | @smoke |
| 2 | Manage Players | @regression |
| 3 | Team Assignment | @regression |
| 4 | Session Configuration | @regression |
| 5 | Match Creation | @regression |
| 6 | Score Entry | @smoke |
| 7 | Score Editing | @nightly |
| 8 | Session Locking | @nightly |
| 9 | Join & Login | @smoke |
| 10 | Quick Match Access | @regression |
| 11 | Deep Links & State | @nightly |
| 12 | Permission Boundaries | @regression |

### Chaos Tests (`tests/e2e/chaos/`)

Network failure and recovery testing:

- **Offline scenarios** - Operations while disconnected
- **Latency injection** - Slow network handling
- **Transient errors** - 500 errors, retries
- **Recovery** - Data integrity after failures

### Fuzz Tests (`tests/e2e/fuzz/`)

Random but reproducible UI testing:

- **Monkey testing** - Random clicks, navigation, form fills
- **Deterministic replay** - Same seed produces same action sequence
- **Action logging** - Full trace on failure for debugging

## Running Tests

### By Tag

```bash
# Smoke tests (< 5 minutes, critical paths)
npm run test:smoke

# Regression tests (< 30 minutes, comprehensive)
npm run test:regression

# Nightly tests (full suite including chaos/fuzz)
npm run test:nightly
```

### By Type

```bash
# Journey tests only
npm run test:journeys

# Chaos tests only
npm run test:chaos

# Fuzz tests only
npm run test:fuzz

# Fuzz tests (CI-friendly, fewer actions)
npm run test:fuzz:ci
```

### Full Simulation

```bash
# Simulate 1000 users (~600 journey runs, 300 chaos runs, 1000 fuzz actions)
npm run test:simulate:1000

# With custom configuration
WORKERS=8 JOURNEY_ITERATIONS=100 npm run test:simulate:1000
```

### Seeding Data

```bash
# Generate small dataset (1 trip, 12 players, 2 sessions)
npm run test:seed:small

# Generate large dataset (3 trips, 48 players, 6 sessions)
npm run test:seed:large

# With custom seed
SEED=my-custom-seed npm run test:seed:large
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CI` | Running in CI environment | - |
| `PLAYWRIGHT_BASE_URL` | App URL | `http://localhost:3000` |
| `TEST_SEED` | Deterministic seed | `golf-ryder-cup-test` |
| `FUZZ_SEED` | Fuzz test seed | Auto-generated |
| `FUZZ_ACTIONS` | Number of fuzz actions | `300` |
| `CHAOS_ENABLED` | Enable chaos mode | `false` |
| `WORKERS` | Parallel workers | Auto |
| `JOURNEY_ITERATIONS` | Simulation iterations | `50` |

### Playwright Config

The config at `playwright.config.ts` supports:

- Multiple browser projects (Chromium, Firefox, WebKit, Mobile)
- Tagged projects (smoke, regression, nightly, chaos, fuzz)
- CI-specific reporters (GitHub, JUnit, JSON)
- Legacy test support (`e2e/` directory)

## Writing Tests

### Using Test Helpers

```typescript
import {
    waitForStableDOM,
    dismissAllBlockingModals,
    enableCaptainMode,
    navigateViaBottomNav,
} from '../utils/test-helpers';

test('example test', async ({ page }) => {
    await page.goto('/');
    await waitForStableDOM(page);
    await dismissAllBlockingModals(page);

    await enableCaptainMode(page, '1234');
    await navigateViaBottomNav(page, 'Standings');

    // ... test assertions
});
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('with fixtures', async ({ setupPage, seedSmallDataset }) => {
    // setupPage is pre-configured with common setup
    // seedSmallDataset has injected test data

    await expect(setupPage.locator('h1')).toBeVisible();
});
```

### Using Seeder

```typescript
import { generateTestData, createSeededRNG } from '../utils/seeder';

const rng = createSeededRNG('my-seed');
const data = generateTestData('my-seed', 'small');

// Data is deterministic - same seed = same data
```

### Tagging Tests

```typescript
test('critical path @smoke', async ({ page }) => {
    // Runs in smoke suite
});

test('full workflow @regression', async ({ page }) => {
    // Runs in regression suite
});

test('edge case @nightly', async ({ page }) => {
    // Runs in nightly suite only
});

test('chaos scenario @chaos', async ({ page }) => {
    // Runs in chaos suite
});
```

## CI Integration

### GitHub Actions

The tests are designed to run in CI with:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run smoke tests
  run: npm run test:smoke

- name: Run regression tests
  run: npm run test:regression

- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: tests/e2e/artifacts/
```

### Nightly Workflow

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  nightly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:nightly
      - run: npm run test:simulate:1000
```

## Troubleshooting

### Test Flakiness

1. Use `waitForStableDOM()` instead of fixed delays
2. Use `getByRole()` / `getByLabel()` selectors
3. Dismiss modals with `dismissAllBlockingModals()`
4. Increase timeouts for CI: `expect(x).toBeVisible({ timeout: 10000 })`

### Reproducing Failures

1. Check the seed in the failure log
2. Re-run with same seed: `FUZZ_SEED=<seed> npm run test:fuzz`
3. Check `tests/e2e/artifacts/fuzz-last-run.json` for action log

### Debugging

```bash
# Run with headed browser
npm run test:pw:headed

# Run with Playwright UI
npm run test:e2e:ui

# Show HTML report
npm run test:e2e:report
```

## Metrics

### Success Criteria

- **Smoke tests**: 100% pass rate required for deploy
- **Regression tests**: 98% pass rate (allows 2% flake)
- **Nightly tests**: 95% pass rate
- **Simulation**: 80% success rate = production-grade

### Coverage Goals

- 12+ core user journeys
- Offline/online transitions
- Network failure recovery
- 1000+ simulated user sessions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Playwright Test Runner                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Smoke  │  │Regression│  │ Nightly │  │Simulate │        │
│  │  Tests  │  │  Tests   │  │  Tests  │  │  1000   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       ▼            ▼            ▼            ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Test Fixtures & Helpers               │   │
│  │  • waitForStableDOM    • dismissAllBlockingModals   │   │
│  │  • seedSmallDataset    • enableCaptainMode          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     Seeder                          │   │
│  │  • createSeededRNG     • generateTestData           │   │
│  │  • toIndexedDBFormat   • getDataStats               │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Golf Ryder Cup App                     │   │
│  │  Next.js + React + Zustand + Dexie (IndexedDB)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Changelog

- **v1.0.0** - Initial testing infrastructure
  - 12 journey test suites
  - Chaos/network failure tests
  - Fuzz/monkey testing
  - 1000 user simulation
  - CI integration
