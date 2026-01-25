#!/bin/bash
# Golf Ryder Cup App - Production Deployment Script
# Run this before deploying to production

set -e

echo "🏌️ Golf Ryder Cup App - Deployment Checklist"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "  $1"
}

echo "📋 1. Environment Variables"
echo "----------------------------"

# Required environment variables
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    check "NEXT_PUBLIC_SUPABASE_URL is set"
else
    check "NEXT_PUBLIC_SUPABASE_URL is set" && false
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    check "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
else
    check "NEXT_PUBLIC_SUPABASE_ANON_KEY is set" && false
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    check "SUPABASE_SERVICE_ROLE_KEY is set"
else
    check "SUPABASE_SERVICE_ROLE_KEY is set" && false
fi

if [ -n "$NEXT_PUBLIC_VAPID_PUBLIC_KEY" ]; then
    check "VAPID public key is set"
else
    warn "VAPID keys not set - push notifications disabled"
fi

if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    check "Sentry DSN is set"
else
    warn "Sentry DSN not set - error monitoring disabled"
fi

if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
    check "APP_URL is set"
    info "URL: $NEXT_PUBLIC_APP_URL"
else
    warn "APP_URL not set - using default"
fi

echo ""
echo "🧪 2. Running Tests"
echo "-------------------"

# Run unit tests
npm run test -- --run --reporter=basic 2>/dev/null
check "Unit tests passed"

# Type check
npm run typecheck 2>/dev/null
check "TypeScript compilation passed"

# Lint
npm run lint 2>/dev/null
check "Lint passed"

echo ""
echo "🏗️  3. Build Check"
echo "------------------"

# Try production build
npm run build 2>/dev/null
check "Production build succeeded"

echo ""
echo "📊 4. Database Schema"
echo "---------------------"

if command -v supabase &> /dev/null; then
    check "Supabase CLI installed"
    info "Run 'supabase db push' to apply migrations"
else
    warn "Supabase CLI not installed"
    info "Install with: npm install -g supabase"
fi

echo ""
echo "🔐 5. Security Checklist"
echo "------------------------"

# Check for hardcoded secrets
if grep -r "sk_live\|pk_live\|password\s*=\s*['\"]" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v ".env" | grep -v "test"; then
    warn "Potential hardcoded secrets found"
else
    check "No hardcoded secrets detected"
fi

# Check for console.log in production code
CONSOLE_COUNT=$(grep -r "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "test" | grep -v ".spec" | wc -l)
if [ "$CONSOLE_COUNT" -gt 10 ]; then
    warn "Found $CONSOLE_COUNT console.log statements"
else
    check "Console logs minimal ($CONSOLE_COUNT found)"
fi

echo ""
echo "📱 6. PWA Configuration"
echo "-----------------------"

if [ -f "public/manifest.json" ]; then
    check "manifest.json exists"
else
    warn "manifest.json missing"
fi

if [ -f "public/sw.js" ]; then
    check "Service worker exists"
else
    warn "Service worker missing"
fi

if [ -d "public/icons" ]; then
    ICON_COUNT=$(ls -1 public/icons/*.png 2>/dev/null | wc -l)
    check "PWA icons exist ($ICON_COUNT icons)"
else
    warn "PWA icons missing"
fi

echo ""
echo "============================================="
echo "📊 Summary"
echo "============================================="

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ $ERRORS errors found - fix before deploying${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings - review recommended${NC}"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed - ready to deploy!${NC}"
fi

echo ""
echo "🚀 Next Steps:"
echo "   1. Set production environment variables in Railway/Vercel"
echo "   2. Run 'supabase db push' for database migrations"
echo "   3. Enable RLS policies in Supabase dashboard"
echo "   4. Deploy: 'git push origin main'"
echo ""

exit $ERRORS
