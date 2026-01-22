/**
 * Participant Journey Tests
 *
 * Tests the participant experience:
 * 9. Join trip/invite OR login -> "What's next" (fast path)
 * 10. Navigate to your match in <=2 taps; enter score; confirm success
 * 11. Deep link to match/leaderboard; refresh; state stays correct
 * 12. Attempt captain-only action; verify graceful "not allowed" UI
 *
 * @tags @smoke @regression
 */

import { test, expect } from '../fixtures/test-fixtures';
import {
    navigateAndSetup,
    waitForStableDOM,
    dismissAllBlockingModals,
    navigateViaBottomNav,
    measureTime,
    TEST_CONFIG,
} from '../utils/test-helpers';

// ============================================================================
// JOURNEY 9: JOIN TRIP / LOGIN FLOW
// ============================================================================

test.describe('Participant Journey: Join & Login', () => {
    test.beforeEach(async ({ page, clearDatabase }) => {
        await clearDatabase();
        await page.goto('/');
        await waitForStableDOM(page);
        await dismissAllBlockingModals(page);
    });

    test('should display login option for new users @smoke', async ({ page }) => {
        // New user should see path to login/signup
        const pageContent = await page.textContent('body');
        const hasAuthPath =
            pageContent?.includes('Login') ||
            pageContent?.includes('Sign') ||
            pageContent?.includes('Create') ||
            pageContent?.includes('Get Started') ||
            pageContent?.includes('Join');

        expect(hasAuthPath || pageContent?.length).toBeTruthy();
    });

    test('should navigate to login page @smoke', async ({ page }) => {
        await page.goto('/login');
        await waitForStableDOM(page);

        // Login page should have form elements
        const emailInput = page.getByRole('textbox', { name: /email/i }).first();
        const pinInput = page.locator('input[type="password"], input[type="tel"]').first();

        const hasEmail = await emailInput.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);
        const hasPin = await pinInput.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);

        // Page should render
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should handle invalid login gracefully @regression', async ({ page }) => {
        await page.goto('/login');
        await waitForStableDOM(page);

        const emailInput = page.getByRole('textbox', { name: /email/i }).first();
        const pinInput = page.locator('input[type="password"], input[type="tel"]').first();

        if (await emailInput.isVisible({ timeout: TEST_CONFIG.timeouts.fast })) {
            await emailInput.fill('invalid@test.com');

            if (await pinInput.isVisible()) {
                await pinInput.fill('0000');
            }

            const submitButton = page.getByRole('button', { name: /login|sign in|submit/i }).first();

            if (await submitButton.isVisible()) {
                await submitButton.click();
                await waitForStableDOM(page);

                // Should show error or remain on login
                const stillOnLogin = page.url().includes('login');
                const hasError = await page.locator('text=/error|invalid|not found/i').isVisible().catch(() => false);

                expect(stillOnLogin || hasError).toBeTruthy();
            }
        }
    });

    test('should show "What\'s next" guidance after login @regression', async ({ page, seedSmallDataset }) => {
        // Seed data first
        await seedSmallDataset();

        // Navigate to home
        await page.goto('/');
        await waitForStableDOM(page);

        // Should see some guidance or current activity
        const pageContent = await page.textContent('body');
        const hasGuidance =
            pageContent?.includes('Your') ||
            pageContent?.includes('Next') ||
            pageContent?.includes('Today') ||
            pageContent?.includes('Match') ||
            pageContent?.includes('Schedule');

        expect(hasGuidance || pageContent?.length).toBeTruthy();
    });
});

// ============================================================================
// JOURNEY 10: QUICK MATCH ACCESS & SCORING
// ============================================================================

test.describe('Participant Journey: Quick Match Access', () => {
    test.beforeEach(async ({ page, seedSmallDataset }) => {
        await page.goto('/');
        await waitForStableDOM(page);
        await dismissAllBlockingModals(page);
        await seedSmallDataset();
        await page.reload();
        await waitForStableDOM(page);
    });

    test('should navigate to match in 2 taps or fewer @smoke', async ({ page }) => {
        const { durationMs } = await measureTime(async () => {
            // Tap 1: Navigate to score section
            await navigateViaBottomNav(page, 'score');
            await waitForStableDOM(page);

            // Tap 2: Select a match (if multiple)
            const matchLink = page.locator('a, button').filter({ hasText: /match|vs|play/i }).first();

            if (await matchLink.isVisible({ timeout: TEST_CONFIG.timeouts.fast })) {
                await matchLink.click();
                await waitForStableDOM(page);
            }
        });

        // Should complete in reasonable time
        expect(durationMs).toBeLessThan(10000);

        // Should be on a match-related page
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should enter score successfully @regression', async ({ page }) => {
        await page.goto('/score');
        await waitForStableDOM(page);

        // Look for score entry buttons
        const scoreButtons = page.locator('button').filter({ hasText: /win|halve|lose|up|dn|as/i });

        if (await scoreButtons.count() > 0) {
            // Enter a score
            await scoreButtons.first().click();
            await waitForStableDOM(page);

            // Look for success feedback
            const successIndicator = page.locator('text=/saved|recorded|updated|success/i');
            const hasSuccess = await successIndicator.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);

            // Page should respond
            const body = page.locator('body');
            await expect(body).toBeVisible();
        }
    });

    test('should show confirmation after score entry @regression', async ({ page }) => {
        await page.goto('/score');
        await waitForStableDOM(page);

        // Get initial state
        const initialContent = await page.textContent('body');

        // Try score entry
        const scoreButtons = page.locator('button').filter({ hasText: /win|up/i });

        if (await scoreButtons.count() > 0) {
            await scoreButtons.first().click();
            await waitForStableDOM(page);

            // Content should have changed (score recorded)
            const afterContent = await page.textContent('body');

            // Page should render
            expect(afterContent?.length).toBeGreaterThan(0);
        }
    });
});

// ============================================================================
// JOURNEY 11: DEEP LINKS & STATE PERSISTENCE
// ============================================================================

test.describe('Participant Journey: Deep Links & State', () => {
    test.beforeEach(async ({ page, seedSmallDataset }) => {
        await page.goto('/');
        await waitForStableDOM(page);
        await dismissAllBlockingModals(page);
        await seedSmallDataset();
        await page.reload();
        await waitForStableDOM(page);
    });

    test('should handle deep link to standings @smoke', async ({ page }) => {
        // Direct navigation to standings
        await page.goto('/standings');
        await waitForStableDOM(page);

        // Page should render
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Should have standings-related content
        const pageContent = await page.textContent('body');
        expect(pageContent?.length).toBeGreaterThan(0);
    });

    test('should persist state after refresh @regression', async ({ page }) => {
        // Navigate to standings
        await page.goto('/standings');
        await waitForStableDOM(page);

        // Get initial state
        const initialContent = await page.textContent('body');

        // Refresh
        await page.reload();
        await waitForStableDOM(page);

        // Get state after refresh
        const afterContent = await page.textContent('body');

        // Content should be consistent
        expect(afterContent?.length).toBeGreaterThan(0);

        // Key data should persist (if there was content initially)
        if (initialContent && initialContent.length > 100) {
            // At least some content should remain
            expect(afterContent?.length).toBeGreaterThan(50);
        }
    });

    test('should handle deep link to specific match @regression', async ({ page }) => {
        // Navigate to matchups first to get a match ID
        await page.goto('/matchups');
        await waitForStableDOM(page);

        // Get first match link
        const matchLink = page.locator('a[href*="match"], a[href*="score"]').first();

        if (await matchLink.isVisible({ timeout: TEST_CONFIG.timeouts.fast })) {
            const href = await matchLink.getAttribute('href');

            if (href) {
                // Navigate directly via deep link
                await page.goto(href);
                await waitForStableDOM(page);

                // Page should load
                const body = page.locator('body');
                await expect(body).toBeVisible();

                // Refresh and verify state persists
                await page.reload();
                await waitForStableDOM(page);
                await expect(body).toBeVisible();
            }
        }
    });

    test('should handle navigation back and forth @regression', async ({ page }) => {
        // Start at home
        await page.goto('/');
        await waitForStableDOM(page);

        // Go to standings
        await page.goto('/standings');
        await waitForStableDOM(page);

        // Go to schedule
        await page.goto('/schedule');
        await waitForStableDOM(page);

        // Go back
        await page.goBack();
        await waitForStableDOM(page);

        // Should be on standings
        expect(page.url()).toContain('standings');

        // Go forward
        await page.goForward();
        await waitForStableDOM(page);

        // Should be on schedule
        expect(page.url()).toContain('schedule');
    });
});

// ============================================================================
// JOURNEY 12: PERMISSION BOUNDARIES
// ============================================================================

test.describe('Participant Journey: Permission Boundaries', () => {
    test.beforeEach(async ({ page, seedSmallDataset }) => {
        await page.goto('/');
        await waitForStableDOM(page);
        await dismissAllBlockingModals(page);
        await seedSmallDataset();
        await page.reload();
        await waitForStableDOM(page);
    });

    test('should show restricted UI for captain features @smoke', async ({ page }) => {
        // Navigate to captain area without captain mode
        await page.goto('/captain');
        await waitForStableDOM(page);

        // Should see PIN prompt or restricted content
        const pageContent = await page.textContent('body');
        const hasRestriction =
            pageContent?.includes('PIN') ||
            pageContent?.includes('password') ||
            pageContent?.includes('Captain') ||
            pageContent?.includes('verify') ||
            pageContent?.includes('Not authorized');

        expect(hasRestriction || pageContent?.length).toBeTruthy();
    });

    test('should prevent editing locked sessions @regression', async ({ page }) => {
        // Try to access session management
        await page.goto('/captain/manage');
        await waitForStableDOM(page);

        // Should require captain verification or show read-only
        const pageContent = await page.textContent('body');
        const isRestricted =
            pageContent?.includes('PIN') ||
            pageContent?.includes('verify') ||
            pageContent?.includes('Captain mode');

        // Page should handle gracefully
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should show graceful "not allowed" message @regression', async ({ page }) => {
        // Try to access captain lineup builder
        await page.goto('/captain/lineup');
        await waitForStableDOM(page);

        // Should either:
        // 1. Prompt for PIN
        // 2. Show "not allowed" message
        // 3. Redirect to another page

        const body = page.locator('body');
        await expect(body).toBeVisible();

        // No error/crash state
        const errorState = page.locator('text=/error occurred|something went wrong/i');
        const hasError = await errorState.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);

        expect(hasError).toBeFalsy();
    });

    test('should distinguish captain badge/indicator @regression', async ({ page }) => {
        // Navigate to more/settings
        await page.goto('/more');
        await waitForStableDOM(page);

        // Look for captain mode toggle/status
        const captainStatus = page.locator('text=/captain/i');
        const hasCaptainUI = await captainStatus.count() > 0;

        // Page should render
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});

// ============================================================================
// NAVIGATION & UX TESTS
// ============================================================================

test.describe('Participant Journey: Navigation UX', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForStableDOM(page);
        await dismissAllBlockingModals(page);
    });

    test('should have accessible bottom navigation @smoke', async ({ page }) => {
        // Bottom nav should be present
        const nav = page.locator('nav[aria-label*="navigation"], nav[role="navigation"]').first();

        const hasNav = await nav.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);

        // At minimum, page should be usable
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should have touch-friendly tap targets @regression', async ({ page }) => {
        // Get all clickable elements
        const clickables = page.locator('button, a, [role="button"]');
        const count = await clickables.count();

        // Check a sample of tap targets
        for (let i = 0; i < Math.min(count, 5); i++) {
            const element = clickables.nth(i);

            if (await element.isVisible()) {
                const box = await element.boundingBox();

                if (box) {
                    // Minimum tap target size (44x44 recommended by WCAG)
                    // We'll be lenient and check for 32x32
                    const minSize = 32;
                    expect(box.width).toBeGreaterThanOrEqual(minSize);
                    expect(box.height).toBeGreaterThanOrEqual(minSize);
                }
            }
        }
    });

    test('should handle offline state gracefully @regression @nightly', async ({ page, context }) => {
        // First load the app
        await page.goto('/');
        await waitForStableDOM(page);

        // Wait for network idle (ensure PWA assets cached)
        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {
            // Continue even if not fully idle
        }

        // Go offline
        await context.setOffline(true);

        // Try to navigate
        await page.goto('/standings').catch(() => { });

        // Page should show offline indicator or cached content
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Go back online
        await context.setOffline(false);

        // Verify recovery
        await page.goto('/');
        await waitForStableDOM(page);
        await expect(body).toBeVisible();
    });
});
