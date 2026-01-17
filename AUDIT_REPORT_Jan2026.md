# Production Readiness Audit Report

**Date:** January 2026
**Auditor:** GitHub Copilot (Claude Opus 4.5)
**Scope:** Wholesale audit for beta → production transition
**Methodology:** Automated analysis + manual code review

---

## Executive Summary

The Golf Ryder Cup Web App is a **well-architected Next.js 16 PWA** with solid foundations. It passes the baseline quality gate (build, lint, typecheck, tests) and has good production docs. However, several **critical and high-priority issues** must be addressed before production launch:

1. **🔴 P0 - PINs stored in plain text** in localStorage (security risk)
2. **🔴 P0 - Cascade deletion gaps** — deleting a trip leaves orphaned records in 9+ tables
3. **🔴 P0 - Missing `holeResults` deletion** — deleting matches leaves scoring data orphaned
4. **🟡 P1 - Multiple `return null` patterns** cause blank screens instead of loading/empty states
5. **🟡 P1 - N+1 query patterns** with multiple `useLiveQuery` calls in page.tsx (991 lines)
6. **🟡 P1 - Missing security headers** in next.config.ts
7. **🟡 P1 - Console.log statements** in production API routes
8. **🟢 P2 - No error tracking** (Sentry/equivalent not configured)
9. **🟢 P2 - Polling without visibility check** — live page polls even when tab is background
10. **🟢 P3 - Legacy/dead code** and 14 ESLint disables needing review

**Recommendation:** Address P0 issues immediately, P1 within 3-5 days, ship with documented P2/P3 tech debt.

---

## A. Architecture & Build

### Findings

| Item | Status | Notes |
|------|--------|-------|
| Next.js 16.1.1 App Router | ✅ | Modern stack |
| React 19.2.3 | ✅ | Latest stable |
| TypeScript strict mode | ⚠️ | Enabled but `any` usage in places |
| Build passes | ✅ | `npm run build` compiles 40 routes |
| Type check passes | ✅ | `npm run typecheck` clean |
| ESLint errors | ✅ | 0 errors (down from 107) |
| ESLint warnings | ⚠️ | 574 warnings (acceptable) |
| Tests pass | ✅ | 96 tests in 4 files |
| PWA manifest | ✅ | Well-configured |
| Service worker | ✅ | Cache-first strategy |
| Standalone output | ✅ | Configured for Railway |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| A.1 | P1 | Missing security headers | [next.config.ts](golf-ryder-cup-web/next.config.ts) | - |
| A.2 | P3 | No image optimization config | [next.config.ts](golf-ryder-cup-web/next.config.ts) | - |
| A.3 | P3 | Bundle size not optimized (framer-motion full import) | Various | - |

### Recommendations

**A.1 Fix (P1):** Add security headers to next.config.ts:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

---

## B. Data Layer & Integrity

### Findings

| Item | Status | Notes |
|------|--------|-------|
| Dexie (IndexedDB) | ✅ | Good choice for offline-first |
| Schema versions | ✅ | 5 versions with proper migrations |
| Indexes | ⚠️ | Missing compound index on scoringEvents |
| Foreign key integrity | 🔴 | No cascade deletion enforcement |
| Zustand stores | ✅ | Clean separation, persist middleware |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| B.1 | **P0** | Cascade deletion misses 9 tables | [tripStore.ts](golf-ryder-cup-web/src/lib/stores/tripStore.ts#L212-L225) | 212-225 |
| B.2 | **P0** | Match deletion misses holeResults | [tripStore.ts](golf-ryder-cup-web/src/lib/stores/tripStore.ts) | - |
| B.3 | P2 | Missing index `[matchId+synced]` on scoringEvents | [db/index.ts](golf-ryder-cup-web/src/lib/db/index.ts) | 94 |
| B.4 | P2 | UUID generation inconsistent (crypto.randomUUID vs custom) | Various | - |

### Cascade Deletion Gap Detail

**Current `deleteTrip` deletes:**

- `teamMembers` ✅
- `matches` ✅
- `sessions` ✅
- `teams` ✅
- `trips` ✅

**Missing (orphaned data):**

- `holeResults` 🔴
- `scoringEvents` 🔴
- `sideBets` 🔴
- `banterPosts` 🔴
- `auditLog` 🔴
- `scheduleDays` 🔴
- `scheduleItems` 🔴
- `tripStats` 🔴
- `tripAwards` 🔴

### Fix (P0)

```typescript
// tripStore.ts deleteTrip fix
deleteTrip: async (tripId) => {
  const teams = await db.teams.where('tripId').equals(tripId).toArray();
  const teamIds = teams.map(t => t.id);

  const sessions = await db.sessions.where('tripId').equals(tripId).toArray();
  const sessionIds = sessions.map(s => s.id);

  const matches = await db.matches.where('sessionId').anyOf(sessionIds).toArray();
  const matchIds = matches.map(m => m.id);

  // Delete in dependency order (leaves → roots)
  await db.holeResults.where('matchId').anyOf(matchIds).delete();  // NEW
  await db.scoringEvents.where('matchId').anyOf(matchIds).delete(); // NEW
  await db.sideBets.where('tripId').equals(tripId).delete();        // NEW
  await db.banterPosts.where('tripId').equals(tripId).delete();     // NEW
  await db.auditLog.where('tripId').equals(tripId).delete();        // NEW
  await db.scheduleDays.where('tripId').equals(tripId).delete();    // NEW
  await db.scheduleItems.where('tripId').equals(tripId).delete();   // NEW
  await db.tripStats.where('tripId').equals(tripId).delete();       // NEW
  await db.tripAwards.where('tripId').equals(tripId).delete();      // NEW
  await db.teamMembers.where('teamId').anyOf(teamIds).delete();
  await db.matches.where('sessionId').anyOf(sessionIds).delete();
  await db.sessions.where('tripId').equals(tripId).delete();
  await db.teams.where('tripId').equals(tripId).delete();
  await db.trips.delete(tripId);

  // ... rest unchanged
},
```

---

## C. Security

### Findings

| Item | Status | Notes |
|------|--------|-------|
| API keys server-only | ✅ | ANTHROPIC_API_KEY, OPENAI_API_KEY properly hidden |
| Supabase anon key | ✅ | Correctly uses NEXT_PUBLIC_ prefix |
| No secrets in repo | ✅ | Checked git history |
| npm audit | ✅ | 0 vulnerabilities |
| XSS protection | ✅ | React escapes by default |
| Auth delegation | ✅ | Supabase handles passwords |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| C.1 | **P0** | PINs stored **plain text** in localStorage | [authStore.ts](golf-ryder-cup-web/src/lib/stores/authStore.ts#L84-L105) | 84-105, 189 |
| C.2 | P1 | No CSP headers | [next.config.ts](golf-ryder-cup-web/next.config.ts) | - |
| C.3 | P2 | No rate limiting on OCR API | [api/scorecard-ocr/route.ts](golf-ryder-cup-web/src/app/api/scorecard-ocr/route.ts) | - |
| C.4 | P3 | Client-side only auth guards | [AuthGuard.tsx](golf-ryder-cup-web/src/components/AuthGuard.tsx) | - |

### PIN Storage Detail (C.1)

```typescript
// Current (INSECURE):
users[id] = { profile, pin };  // pin is plain text "1234"
localStorage.setItem('golf-app-users', JSON.stringify(users));

// Login compares:
if (userEntry.pin !== pin) { ... }  // Direct string comparison
```

### Fix (P0) - Hash PINs

```typescript
// utils/crypto.ts (new file)
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const inputHash = await hashPin(pin);
  return inputHash === hash;
}

// authStore.ts changes:
// In createProfile:
users[id] = { profile, pin: await hashPin(pin) };

// In login:
if (!(await verifyPin(pin, userEntry.pin))) { ... }
```

**Migration note:** Existing users will need to reset PIN on first login after upgrade.

---

## D. Error Handling & UX Reliability

### Findings

| Item | Status | Notes |
|------|--------|-------|
| Error boundaries | ✅ | Present in layout.tsx |
| Toast notifications | ✅ | Sonner toasts implemented |
| Loading skeletons | ⚠️ | Present but inconsistent |
| Form validation | ✅ | Zod + react-hook-form |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| D.1 | P1 | `return null` without loading state | Multiple pages | See list |
| D.2 | P1 | Unhandled async in bet settlement | [bets/[betId]/page.tsx](golf-ryder-cup-web/src/app/bets/[betId]/page.tsx) | ~150 |
| D.3 | P2 | Silent error swallowing in captain pages | Various | - |
| D.4 | P2 | No empty state for achievements | [achievements/page.tsx](golf-ryder-cup-web/src/app/achievements/page.tsx) | - |

### `return null` Occurrences

Pages that return null without loading/error states:

- [achievements/page.tsx](golf-ryder-cup-web/src/app/achievements/page.tsx)
- [standings/page.tsx](golf-ryder-cup-web/src/app/standings/page.tsx)
- [lineup/new/page.tsx](golf-ryder-cup-web/src/app/lineup/new/page.tsx)
- [profile/page.tsx](golf-ryder-cup-web/src/app/profile/page.tsx)
- [captain/manage/page.tsx](golf-ryder-cup-web/src/app/captain/manage/page.tsx)
- ~10 more captain subpages

### Fix Pattern (P1)

Replace:

```tsx
if (!trip) return null;
```

With:

```tsx
if (!trip) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );
}
```

---

## E. Performance

### Findings

| Item | Status | Notes |
|------|--------|-------|
| Build time | ✅ | ~23s (acceptable) |
| Route count | ✅ | 40 routes |
| Turbopack | ✅ | Using built-in bundler |
| Code splitting | ✅ | App Router automatic |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| E.1 | P1 | 991-line page.tsx with multiple useLiveQuery | [page.tsx](golf-ryder-cup-web/src/app/page.tsx) | 1-991 |
| E.2 | P1 | N+1 query pattern (7+ useLiveQuery calls) | [page.tsx](golf-ryder-cup-web/src/app/page.tsx) | Various |
| E.3 | P2 | Large components >700 lines (7 files) | Various | See list |
| E.4 | P2 | Polling without visibility check | [live/page.tsx](golf-ryder-cup-web/src/app/live/page.tsx) | - |
| E.5 | P3 | Full framer-motion import | Various | - |

### Large Files (>700 lines)

| File | Lines | Recommendation |
|------|-------|----------------|
| [app/page.tsx](golf-ryder-cup-web/src/app/page.tsx) | 991 | Extract widgets to components |
| [captain/manage/page.tsx](golf-ryder-cup-web/src/app/captain/manage/page.tsx) | 800+ | Split session/match logic |
| [scoring/ScoringInterface.tsx](golf-ryder-cup-web/src/components/scoring/ScoringInterface.tsx) | 750+ | Extract hole card component |

### N+1 Query Fix (E.2)

Instead of multiple `useLiveQuery` calls, consolidate:

```typescript
// Before (7 separate queries):
const trips = useLiveQuery(() => db.trips.toArray());
const sessions = useLiveQuery(() => db.sessions.toArray());
const matches = useLiveQuery(() => db.matches.toArray());
// ... etc

// After (single composite query):
const dashboardData = useLiveQuery(async () => {
  const [trips, sessions, matches] = await Promise.all([
    db.trips.toArray(),
    db.sessions.toArray(),
    db.matches.toArray(),
  ]);
  return { trips, sessions, matches };
});
```

---

## F. Observability

### Findings

| Item | Status | Notes |
|------|--------|-------|
| Console.log for debugging | ⚠️ | 20+ in codebase |
| Console.error for errors | ⚠️ | 30+ in codebase |
| Error tracking (Sentry) | 🔴 | Not configured |
| Analytics | 🔴 | Not configured |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| F.1 | P1 | Console.log in API routes (leaks to logs) | [api/scorecard-ocr/route.ts](golf-ryder-cup-web/src/app/api/scorecard-ocr/route.ts) | Multiple |
| F.2 | P2 | No Sentry/error tracking | - | - |
| F.3 | P2 | No analytics | - | - |
| F.4 | P3 | Debug logs in production | Various | - |

### Console Statements Found

```
src/app/api/scorecard-ocr/route.ts - 5 console.log statements
src/lib/services/*.ts - 10+ console.log statements
src/app/*/page.tsx - 5+ console.error statements
```

### Recommendations

1. **P1:** Remove console.log from API routes
2. **P2:** Add Sentry for error tracking before launch
3. **P3:** Replace console.log with structured logger that respects NODE_ENV

---

## G. Code Quality & Maintainability

### Findings

| Item | Status | Notes |
|------|--------|-------|
| TypeScript coverage | ✅ | Good types throughout |
| Component patterns | ✅ | Consistent structure |
| Store patterns | ✅ | Zustand with persist |
| Test coverage | ⚠️ | 96 tests, but gaps in UI |

### Issues

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| G.1 | P2 | Code duplication (team fetching in 4+ components) | Various | - |
| G.2 | P2 | Legacy file exists | [page-legacy.tsx](golf-ryder-cup-web/src/app/page-legacy.tsx) | - |
| G.3 | P3 | 3 TODO/FIXME comments unresolved | Various | - |
| G.4 | P3 | 14 ESLint disables | Various | - |
| G.5 | P3 | Inconsistent date formatting | Various | - |

### ESLint Disables Found (G.4)

```
// eslint-disable-next-line @typescript-eslint/no-explicit-any (8 occurrences)
// eslint-disable-next-line react-hooks/exhaustive-deps (4 occurrences)
// eslint-disable-next-line @typescript-eslint/no-unused-vars (2 occurrences)
```

---

## Improvement Plan

### 1. Prioritized Backlog

| Priority | ID | Issue | Effort | Risk if Skipped |
|----------|-----|-------|--------|-----------------|
| **P0** | C.1 | Hash PINs | 2h | **Critical** - Security vulnerability |
| **P0** | B.1 | Cascade deletion | 2h | **Critical** - Data corruption |
| **P0** | B.2 | Match deletion | 30m | **Critical** - Orphaned scores |
| **P1** | A.1 | Security headers | 30m | High - Security best practice |
| **P1** | D.1 | `return null` → loading states | 2h | High - Blank screen UX |
| **P1** | E.1 | Refactor page.tsx | 4h | High - Maintenance burden |
| **P1** | F.1 | Remove console.log from APIs | 30m | High - Log pollution |
| **P2** | F.2 | Add Sentry | 1h | Medium - No error visibility |
| **P2** | E.4 | Visibility check for polling | 30m | Medium - Battery drain |
| **P2** | G.1 | Extract shared team logic | 2h | Medium - Duplication |
| **P3** | G.2 | Delete legacy file | 5m | Low - Clutter |
| **P3** | G.4 | Review ESLint disables | 1h | Low - Tech debt |

### 2. 7-Day Ship Plan

| Day | Focus | Tasks |
|-----|-------|-------|
| **Day 1** | P0 Security | C.1 Hash PINs, write migration |
| **Day 2** | P0 Data Integrity | B.1 Cascade deletion, B.2 Match deletion |
| **Day 3** | P1 Security + UX | A.1 Headers, D.1 Loading states (5 pages) |
| **Day 4** | P1 Performance | E.1 Refactor page.tsx, consolidate queries |
| **Day 5** | P1 Cleanup | F.1 Console.log cleanup, D.1 remaining pages |
| **Day 6** | P2 Observability | F.2 Sentry setup, E.4 Visibility check |
| **Day 7** | Testing & QA | Manual flow testing, smoke tests |

### 3. Quality Checklist (Pre-Launch)

- [ ] All P0 issues resolved
- [ ] All P1 issues resolved or documented as known
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] Manual testing of all user flows
- [ ] Manual testing of all captain flows
- [ ] PWA install tested on iOS Safari
- [ ] PWA install tested on Android Chrome
- [ ] Offline mode tested
- [ ] Error tracking configured
- [ ] Environment variables documented

### 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PIN migration breaks existing users | Medium | High | Add migration flow with PIN reset |
| Cascade deletion deletes too much | Low | High | Add confirmation dialog, test thoroughly |
| Performance regression from refactor | Low | Medium | Benchmark before/after |
| Security headers break CORS | Low | Medium | Test with production API calls |

### 5. Post-Launch Tech Debt (P2/P3)

These items are acceptable to ship with, documented for future sprints:

1. **P2:** Add Sentry error tracking within 2 weeks
2. **P2:** Visibility-based polling (battery optimization)
3. **P2:** Extract shared team fetching logic
4. **P3:** Review and resolve ESLint disables
5. **P3:** Delete legacy files
6. **P3:** Bundle size optimization (tree-shake framer-motion)
7. **P3:** Add comprehensive UI test coverage

---

## Appendix: Files Requiring Changes

### Immediate (P0)

| File | Changes Needed |
|------|----------------|
| [src/lib/stores/authStore.ts](golf-ryder-cup-web/src/lib/stores/authStore.ts) | Hash PINs with SHA-256 |
| [src/lib/stores/tripStore.ts](golf-ryder-cup-web/src/lib/stores/tripStore.ts) | Add cascade deletion for 9 tables |
| [src/lib/utils/crypto.ts](golf-ryder-cup-web/src/lib/utils/crypto.ts) | NEW: hashPin, verifyPin functions |

### Short-term (P1)

| File | Changes Needed |
|------|----------------|
| [next.config.ts](golf-ryder-cup-web/next.config.ts) | Add security headers |
| [src/app/page.tsx](golf-ryder-cup-web/src/app/page.tsx) | Consolidate queries, extract components |
| [src/app/achievements/page.tsx](golf-ryder-cup-web/src/app/achievements/page.tsx) | Add loading state |
| [src/app/standings/page.tsx](golf-ryder-cup-web/src/app/standings/page.tsx) | Add loading state |
| [src/app/lineup/new/page.tsx](golf-ryder-cup-web/src/app/lineup/new/page.tsx) | Add loading state |
| [src/app/api/scorecard-ocr/route.ts](golf-ryder-cup-web/src/app/api/scorecard-ocr/route.ts) | Remove console.log |
| 10+ captain pages | Add loading states |

### Documentation Updates

| File | Changes Needed |
|------|----------------|
| [Docs/ProductionReadiness.md](Docs/ProductionReadiness.md) | Update with audit findings |
| [Docs/SecurityNotes.md](Docs/SecurityNotes.md) | Add PIN hashing note |
| README.md | Add migration instructions |

---

**Audit Complete**

*This audit identified 2 P0 (critical), 6 P1 (high), 7 P2 (medium), and 6 P3 (low) issues. The P0 issues (PIN storage, cascade deletion) must be fixed before production. With the 7-day plan, the app can be production-ready.*
