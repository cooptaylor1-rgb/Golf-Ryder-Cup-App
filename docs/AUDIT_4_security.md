# AUDIT 4 — Security Review

## Findings (facts only)

### 1) RLS policies are effectively open

- **Evidence:** [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql) defines `USING (true)` for core tables (trips, teams, matches, hole_results, etc.).
- **Risk:** Anonymous clients can read/write all data.

### 2) Trip access check grants access with only tripId

- **Evidence:** [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts) — `verifyTripAccess()` returns authorized if trip has `share_code` even without presenting it.
- **Risk:** Anyone who knows a trip UUID can access protected endpoints.

### 3) Push subscription API lacks auth

- **Evidence:** [golf-ryder-cup-web/src/app/api/push/subscribe/route.ts](../golf-ryder-cup-web/src/app/api/push/subscribe/route.ts) stores subscriptions without verifying user/trip access.
- **Risk:** Unauthorized registration or spam.

### 4) CSP allows unsafe script execution

- **Evidence:** [golf-ryder-cup-web/next.config.ts](../golf-ryder-cup-web/next.config.ts) includes `unsafe-inline` and `unsafe-eval`.
- **Risk:** Expands XSS impact surface.

### 5) Service role usage in server routes relies on app‑level auth

- **Evidence:** [golf-ryder-cup-web/src/app/api/sync/scores/route.ts](../golf-ryder-cup-web/src/app/api/sync/scores/route.ts) uses service role key; access gating is handled in `requireTripAccess()`.
- **Risk:** Any auth bypass becomes full DB write privilege.

## Fix‑First Patch List (≤5 items, highest value)

1. **Lock down RLS**
   - Replace `USING (true)` with policies scoped to share_code or authenticated membership.
   - Files: [golf-ryder-cup-web/supabase/schema.sql](../golf-ryder-cup-web/supabase/schema.sql)

2. **Fix trip access gating**
   - Require a valid `X-Share-Code` header (or signed auth) for all protected endpoints.
   - Files: [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts)

3. **Harden push subscription API**
   - Require auth or share code validation for writes; avoid accepting arbitrary `userId`/`tripId`.
   - Files: [golf-ryder-cup-web/src/app/api/push/subscribe/route.ts](../golf-ryder-cup-web/src/app/api/push/subscribe/route.ts)

4. **Limit CSP in production**
   - Remove `unsafe-eval` and reduce `unsafe-inline` where possible.
   - Files: [golf-ryder-cup-web/next.config.ts](../golf-ryder-cup-web/next.config.ts)

5. **Add minimal audit logging for API access**
   - Log trip access checks and rate‑limit violations to Sentry or audit table.
   - Files: [golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts](../golf-ryder-cup-web/src/lib/utils/apiMiddleware.ts)
