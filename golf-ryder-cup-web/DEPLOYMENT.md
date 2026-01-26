# 🚀 Golf Ryder Cup App - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed

- [x] Supabase credentials configured
- [x] VAPID keys generated for push notifications
- [x] RLS policies enabled in database schema
- [x] API middleware with trip authorization
- [x] Railway.toml configured
- [x] All 677 tests passing
- [x] Production build successful

### 📋 Production Environment Variables

Set these in your Railway/Vercel dashboard:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mnijxtasggfxzokctuyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Required - Application
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPiTNVBf4wqzxTwRAzPLo7iBLyWMiO0COuZYXwKNSgAk6zZULc_o3n9jNo1SOATjqqkVm2GREPz_j_sTSEx6b50
VAPID_PRIVATE_KEY=N7TDIGt0qri4vmPTUIgbE58hi3JWTsY6oltsWfzDOT4
VAPID_SUBJECT=mailto:admin@golfrydercup.app

# Optional - Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=golf-ryder-cup
```

## Deployment Steps

### 1. Railway Deployment

```bash
# Already configured via railway.toml
git push origin main
```

Railway will automatically:

- Install dependencies
- Run production build
- Start the app on port 3000
- Run health checks

### 2. Supabase Database Setup

#### Option A: Supabase CLI (Recommended)

```bash
npm install -g supabase
supabase login
supabase link --project-ref mnijxtasggfxzokctuyx
supabase db push
```

#### Option B: SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Navigate to SQL Editor
4. Copy contents of `supabase/schema.sql`
5. Run the SQL

### 3. Post-Deployment Verification

1. **Health Check**: Visit `https://your-domain.com/api/health`
2. **Create a Trip**: Test trip creation flow
3. **Test Sync**: Verify cloud sync works
4. **Push Notifications**: Test notification delivery
5. **Share Code**: Test joining via share code

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Client (PWA/Native)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Next.js   │  │  IndexedDB  │  │  Service Worker     │  │
│  │   React     │  │  (Offline)  │  │  (Push/Cache)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ /api/sync/*  │  │ /api/push/* │  │ /api/golf-courses│   │
│  │ (Cloud Sync) │  │ (Push Notif)│  │ (Course Lookup)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │  Realtime    │  │  Row Level       │   │
│  │  Database    │  │  Subscriptions│  │  Security        │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Feature Status

| Feature | Status | Notes |
| --------- | -------- | ------- |
| Trip Management | ✅ Production | Full CRUD with share codes |
| Team Builder | ✅ Production | USA vs Europe + custom |
| Live Scoring | ✅ Production | Match play scoring engine |
| Cloud Sync | ✅ Production | Supabase real-time |
| Offline Mode | ✅ Production | IndexedDB with sync queue |
| Push Notifications | ✅ Production | VAPID keys configured |
| Voice Scoring | ✅ Production | Web Speech API |
| Side Games | ✅ Production | Skins, Nassau, KP |
| Handicap Calculations | ✅ Production | Course handicap engine |
| Native iOS/Android | ✅ Ready | Capacitor configured |

## Troubleshooting

### "Share code not found"

- Check that the trip exists in Supabase
- Verify share code is case-insensitive

### Push notifications not working

- Verify VAPID keys are set
- Check browser supports Web Push
- Ensure HTTPS is enabled

### Sync failures

- Check Supabase credentials
- Verify RLS policies are applied
- Check API rate limits

## Support

For issues, check:

1. Browser console for client errors
2. Railway logs for server errors
3. Supabase logs for database errors

---
*Last updated: January 2026*
*Version: 1.0.0*
