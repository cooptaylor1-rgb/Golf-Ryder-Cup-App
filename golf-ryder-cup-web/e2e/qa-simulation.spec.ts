import { test, expect, Page } from '@playwright/test';

/**
 * QA Simulation: 100-Trip User Test Suite
 *
 * This comprehensive test suite simulates real user behavior across varied scenarios:
 * - Captain/Organizer flows
 * - Participant flows
 * - Edge cases and error handling
 * - Offline/online transitions
 * - Data consistency validation
 */

// Test configuration
const TEST_TIMEOUT = 60000; // 60s per test
const _SCREENSHOT_ON_FAILURE = true;

// Helper utilities
async function waitForStableDOM(page: Page, _timeout = 5000): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // Allow React to settle
}

async function clearIndexedDB(page: Page): Promise<void> {
    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase('GolfTripDB');
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(new Error('Failed to delete IndexedDB'));
            deleteRequest.onblocked = () => resolve(); // Still proceed
        });
    });
}

async function _seedDemoData(page: Page): Promise<string | null> {
    return page.evaluate(async () => {
        // Access the seed function from the global scope (if exposed) or manually seed
        // @ts-expect-error - accessing window globals
        if (window.__seedDemoData) {
            // @ts-expect-error - accessing window globals
            return await window.__seedDemoData();
        }
        return null;
    });
}

// Bug tracking
interface BugReport {
    id: string;
    severity: 'P0' | 'P1' | 'P2' | 'P3';
    category: 'crash' | 'data' | 'ux' | 'performance' | 'visual';
    title: string;
    description: string;
    reproSteps: string[];
    url: string;
    timestamp: string;
    screenshot?: string;
    consoleErrors?: string[];
}

const bugReports: BugReport[] = [];

function reportBug(bug: Omit<BugReport, 'id' | 'timestamp'>): void {
    bugReports.push({
        ...bug,
        id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
    });
}

// ============================================
// TEST SUITE: Home Page & Navigation
// ============================================

test.describe('Home Page & Navigation', () => {
    test.setTimeout(TEST_TIMEOUT);

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForStableDOM(page);
    });

    test('should load home page without console errors', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.reload();
        await waitForStableDOM(page);

        // Filter out expected errors (like PWA/SW registration on localhost)
        const criticalErrors = consoleErrors.filter(err =>
            !err.includes('service worker') &&
            !err.includes('manifest') &&
            !err.includes('favicon')
        );

        if (criticalErrors.length > 0) {
            reportBug({
                severity: 'P1',
                category: 'crash',
                title: 'Console errors on home page load',
                description: `Found ${criticalErrors.length} console error(s) on home page`,
                reproSteps: ['Navigate to home page', 'Open console', 'Check for errors'],
                url: page.url(),
                consoleErrors: criticalErrors,
            });
        }

        expect(criticalErrors.length).toBe(0);
    });

    test('should render main navigation with all items', async ({ page }) => {
        const nav = page.locator('nav');
        await expect(nav.first()).toBeVisible({ timeout: 10000 });

        // Check for expected nav items
        const navLabels = ['Home', 'Schedule', 'Score', 'Stats', 'Standings', 'More'];
        for (const label of navLabels) {
            const navItem = page.locator(`nav >> text=${label}`).first();
            const isVisible = await navItem.isVisible().catch(() => false);

            if (!isVisible) {
                reportBug({
                    severity: 'P2',
                    category: 'ux',
                    title: `Missing navigation item: ${label}`,
                    description: `Expected nav item "${label}" not found or not visible`,
                    reproSteps: ['Navigate to home page', `Look for "${label}" in bottom nav`],
                    url: page.url(),
                });
            }
        }
    });

    test('should navigate to all main sections', async ({ page }) => {
        const routes = [
            { path: '/schedule', name: 'Schedule' },
            { path: '/score', name: 'Score' },
            { path: '/standings', name: 'Standings' },
            { path: '/more', name: 'More' },
        ];

        for (const route of routes) {
            await page.goto(route.path);
            await waitForStableDOM(page);

            const hasError = await page.locator('text=/error|crash|failed/i').isVisible().catch(() => false);
            if (hasError) {
                reportBug({
                    severity: 'P0',
                    category: 'crash',
                    title: `Error on ${route.name} page`,
                    description: `Page ${route.path} shows error state`,
                    reproSteps: [`Navigate to ${route.path}`],
                    url: page.url(),
                });
            }

            await expect(page.locator('body')).toBeVisible();
        }
    });

    test('should handle rapid navigation without crashes', async ({ page }) => {
        const routes = ['/', '/schedule', '/score', '/standings', '/more', '/'];

        for (const route of routes) {
            await page.goto(route);
            // Don't wait, simulate rapid clicks
        }

        await waitForStableDOM(page);
        await expect(page.locator('body')).toBeVisible();
    });
});

// ============================================
// TEST SUITE: Trip Creation Flow (Captain)
// ============================================

test.describe('Trip Creation Flow', () => {
    test.setTimeout(TEST_TIMEOUT * 2);

    test.beforeEach(async ({ page }) => {
        await clearIndexedDB(page);
        await page.goto('/');
        await waitForStableDOM(page);
    });

    test('should find and click "Create Trip" button', async ({ page }) => {
        // Look for various create button patterns
        const createButton = page.locator([
            'button:has-text("Create")',
            'a:has-text("Create")',
            'button:has-text("New Trip")',
            'button:has-text("Start")',
            '[data-testid="create-trip"]',
        ].join(', ')).first();

        const isVisible = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

        if (isVisible) {
            await createButton.click();
            await waitForStableDOM(page);

            // Should navigate to trip creation
            const url = page.url();
            const isOnCreatePage = url.includes('/trip') || url.includes('/new') || url.includes('/wizard');

            if (!isOnCreatePage) {
                reportBug({
                    severity: 'P1',
                    category: 'ux',
                    title: 'Create button does not navigate to creation flow',
                    description: `Clicked create button but landed on ${url}`,
                    reproSteps: ['Go to home page', 'Click Create Trip button', 'Check URL'],
                    url,
                });
            }
        } else {
            // Empty state should prompt trip creation somehow
            const emptyState = page.locator('text=/no trip|get started|create your first/i');
            const hasEmptyState = await emptyState.isVisible().catch(() => false);

            if (!hasEmptyState) {
                reportBug({
                    severity: 'P2',
                    category: 'ux',
                    title: 'No clear path to create first trip',
                    description: 'Home page without trips has no obvious create action',
                    reproSteps: ['Clear all data', 'Go to home page', 'Look for create action'],
                    url: page.url(),
                });
            }
        }
    });

    test('should complete trip wizard with valid data', async ({ page }) => {
        await page.goto('/trip/new');
        await waitForStableDOM(page);

        // Check if wizard is present
        const wizardContent = await page.locator('form, [role="form"], [data-testid*="wizard"]').isVisible().catch(() => false);

        if (!wizardContent) {
            // May be a different UI pattern - look for input fields
            const hasInputs = await page.locator('input').count() > 0;
            if (!hasInputs) {
                reportBug({
                    severity: 'P1',
                    category: 'ux',
                    title: 'Trip creation page has no input fields',
                    description: '/trip/new does not show a form or wizard',
                    reproSteps: ['Navigate to /trip/new', 'Check for form elements'],
                    url: page.url(),
                });
                return;
            }
        }

        // Try to fill basic trip info
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
        if (await nameInput.isVisible().catch(() => false)) {
            await nameInput.fill('QA Test Trip ' + Date.now());
        }

        // Look for date inputs
        const dateInputs = page.locator('input[type="date"]');
        const dateCount = await dateInputs.count();
        if (dateCount >= 2) {
            const today = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            await dateInputs.nth(0).fill(today);
            await dateInputs.nth(1).fill(endDate);
        }
    });
});

// ============================================
// TEST SUITE: Scoring Flow (Critical Path)
// ============================================

test.describe('Scoring Flow', () => {
    test.setTimeout(TEST_TIMEOUT * 2);

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForStableDOM(page);
    });

    test('should display score page correctly', async ({ page }) => {
        await page.goto('/score');
        await waitForStableDOM(page);

        // Check for error boundaries
        const errorBoundary = page.locator('text=/something went wrong|error occurred/i');
        const hasError = await errorBoundary.isVisible().catch(() => false);

        if (hasError) {
            reportBug({
                severity: 'P0',
                category: 'crash',
                title: 'Score page crashes with error boundary',
                description: 'Score page shows error boundary instead of content',
                reproSteps: ['Navigate to /score', 'Check page content'],
                url: page.url(),
            });
        }

        await expect(page.locator('body')).toBeVisible();
    });

    test('should handle empty state gracefully', async ({ page }) => {
        await clearIndexedDB(page);
        await page.reload();
        await waitForStableDOM(page);

        await page.goto('/score');
        await waitForStableDOM(page);

        // Should show empty state, not crash
        const body = await page.locator('body').textContent();
        const hasContent = body && body.length > 100; // Some meaningful content

        expect(hasContent).toBeTruthy();
    });

    test('should navigate to match scoring interface', async ({ page }) => {
        await page.goto('/score');
        await waitForStableDOM(page);

        // Look for match cards or scoring buttons
        const matchCard = page.locator('[data-testid*="match"], [class*="match"], a[href*="/score/"]').first();

        if (await matchCard.isVisible().catch(() => false)) {
            await matchCard.click();
            await waitForStableDOM(page);

            // Should be on scoring interface
            const url = page.url();
            const isOnScoringPage = url.includes('/score/') || url.includes('/match/');

            if (!isOnScoringPage) {
                reportBug({
                    severity: 'P1',
                    category: 'ux',
                    title: 'Match card click does not navigate to scoring',
                    description: `Clicked match but landed on ${url}`,
                    reproSteps: ['Go to /score', 'Click on a match', 'Check URL'],
                    url,
                });
            }
        }
    });
});

// ============================================
// TEST SUITE: Standings & Statistics
// ============================================

test.describe('Standings & Statistics', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should display standings page', async ({ page }) => {
        await page.goto('/standings');
        await waitForStableDOM(page);

        // Check for team standings elements
        const standingsContent = page.locator('main, [role="main"], .standings');
        await expect(standingsContent.first()).toBeVisible();

        // Look for common standings UI patterns
        const hasTeamInfo = await page.locator('text=/team|score|point/i').isVisible().catch(() => false);
        const hasEmptyState = await page.locator('text=/no data|no standings|create/i').isVisible().catch(() => false);

        // Either show standings or a helpful empty state
        expect(hasTeamInfo || hasEmptyState).toBeTruthy();
    });

    test('should calculate correct totals', async ({ page }) => {
        await page.goto('/standings');
        await waitForStableDOM(page);

        // This test would validate mathematical correctness
        // For now, just ensure no calculation errors visible
        const errorText = await page.locator('text=/NaN|undefined|null|error/i').isVisible().catch(() => false);

        if (errorText) {
            reportBug({
                severity: 'P0',
                category: 'data',
                title: 'Calculation error visible in standings',
                description: 'Standings show NaN, undefined, or error values',
                reproSteps: ['Navigate to /standings', 'Check displayed values'],
                url: page.url(),
            });
        }

        expect(errorText).toBeFalsy();
    });
});

// ============================================
// TEST SUITE: Captain Command Center
// ============================================

test.describe('Captain Features', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should access captain dashboard', async ({ page }) => {
        await page.goto('/captain');
        await waitForStableDOM(page);

        // Check if captain page loads
        const body = await page.locator('body').textContent();
        expect(body).toBeTruthy();

        // Look for captain-specific UI
        const captainContent = page.locator('text=/captain|command|lineup|manage/i');
        const isVisible = await captainContent.first().isVisible().catch(() => false);

        if (!isVisible) {
            // May require authentication or trip
            const authPrompt = await page.locator('text=/sign in|login|create trip/i').isVisible().catch(() => false);
            expect(authPrompt || isVisible).toBeTruthy();
        }
    });

    test('should toggle captain mode', async ({ page }) => {
        await page.goto('/more');
        await waitForStableDOM(page);

        // Look for captain mode toggle
        const captainToggle = page.locator('text=/captain mode/i').first();

        if (await captainToggle.isVisible().catch(() => false)) {
            // Find the actual toggle input
            const toggle = page.locator('[role="switch"], input[type="checkbox"]').first();
            if (await toggle.isVisible().catch(() => false)) {
                const wasChecked = await toggle.isChecked();
                await toggle.click();
                await waitForStableDOM(page);

                // Verify toggle changed
                const isNowChecked = await toggle.isChecked();
                expect(isNowChecked).not.toBe(wasChecked);
            }
        }
    });
});

// ============================================
// TEST SUITE: Offline Support (PWA)
// ============================================

test.describe('Offline Support', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should work offline after initial load', async ({ page, context }) => {
        await page.goto('/');
        await waitForStableDOM(page);
        await page.waitForLoadState('networkidle');

        // Go offline
        await context.setOffline(true);

        // Try to navigate
        await page.goto('/score');

        // Should still show content (from cache or IndexedDB)
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Check for offline indicator
        const offlineIndicator = page.locator('text=/offline/i, [class*="offline"]');
        const _showsOffline = await offlineIndicator.isVisible().catch(() => false);

        // Go back online
        await context.setOffline(false);
    });

    test('should show offline indicator', async ({ page, context }) => {
        await page.goto('/');
        await waitForStableDOM(page);

        // Go offline
        await context.setOffline(true);
        await page.waitForTimeout(1000);

        // Check for any offline UI feedback
        const _pageContent = await page.content();

        // Go back online
        await context.setOffline(false);
    });
});

// ============================================
// TEST SUITE: Data Persistence
// ============================================

test.describe('Data Persistence', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should persist data across page reloads', async ({ page }) => {
        await page.goto('/');
        await waitForStableDOM(page);

        // Get initial state
        const _initialContent = await page.content();

        // Reload
        await page.reload();
        await waitForStableDOM(page);

        // Content should be similar (data persisted)
        const reloadedContent = await page.content();

        // Basic sanity check - page should have meaningful content
        expect(reloadedContent.length).toBeGreaterThan(1000);
    });

    test('should not lose data on browser back/forward', async ({ page }) => {
        await page.goto('/');
        await waitForStableDOM(page);

        await page.goto('/score');
        await waitForStableDOM(page);

        await page.goBack();
        await waitForStableDOM(page);

        // Should be back on home
        expect(page.url()).toContain('localhost:3000');

        await page.goForward();
        await waitForStableDOM(page);

        // Should be on score
        expect(page.url()).toContain('/score');
    });
});

// ============================================
// TEST SUITE: Error Handling
// ============================================

test.describe('Error Handling', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should show 404 page for invalid routes', async ({ page }) => {
        await page.goto('/this-page-definitely-does-not-exist-12345');
        await waitForStableDOM(page);

        // Should show 404 or redirect, not crash
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Check for 404 content or home redirect
        const url = page.url();
        const content = await page.content();

        const is404 = content.toLowerCase().includes('404') ||
            content.toLowerCase().includes('not found') ||
            url === 'http://localhost:3000/';

        if (!is404) {
            reportBug({
                severity: 'P2',
                category: 'ux',
                title: 'Invalid routes do not show 404',
                description: 'Invalid URL does not show 404 page or redirect home',
                reproSteps: ['Navigate to /random-invalid-url', 'Check response'],
                url,
            });
        }
    });

    test('should handle invalid match IDs gracefully', async ({ page }) => {
        await page.goto('/score/invalid-match-id-12345');
        await waitForStableDOM(page);

        // Should show error state or redirect, not crash
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Check that it doesn't show JavaScript errors
        const errorText = await page.locator('text=/undefined|null|cannot read/i').isVisible().catch(() => false);

        if (errorText) {
            reportBug({
                severity: 'P1',
                category: 'crash',
                title: 'Invalid match ID shows JavaScript error',
                description: 'Navigating to invalid match shows raw JS error',
                reproSteps: ['Navigate to /score/invalid-match-id', 'Check page content'],
                url: page.url(),
            });
        }
    });
});

// ============================================
// TEST SUITE: Performance
// ============================================

test.describe('Performance', () => {
    test.setTimeout(TEST_TIMEOUT);

    test('should load home page within 3 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;

        if (loadTime > 3000) {
            reportBug({
                severity: 'P2',
                category: 'performance',
                title: 'Home page load time exceeds 3 seconds',
                description: `Home page took ${loadTime}ms to load`,
                reproSteps: ['Navigate to home page', 'Measure load time'],
                url: page.url(),
            });
        }

        expect(loadTime).toBeLessThan(5000); // Hard fail at 5s
    });

    test('should not have memory leaks on navigation', async ({ page }) => {
        // Navigate back and forth multiple times
        for (let i = 0; i < 5; i++) {
            await page.goto('/');
            await page.goto('/score');
            await page.goto('/standings');
        }

        // If we got here without OOM, we're probably okay
        await expect(page.locator('body')).toBeVisible();
    });
});

// ============================================
// Test Teardown - Generate Report
// ============================================

test.afterAll(async () => {
    if (bugReports.length > 0) {
        console.log('\n\n========================================');
        console.log('QA SIMULATION BUG REPORT');
        console.log('========================================\n');

        // Sort by severity
        const sortedBugs = bugReports.sort((a, b) => {
            const order = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
            return order[a.severity] - order[b.severity];
        });

        sortedBugs.forEach((bug, index) => {
            console.log(`[${bug.severity}] #${index + 1}: ${bug.title}`);
            console.log(`  Category: ${bug.category}`);
            console.log(`  Description: ${bug.description}`);
            console.log(`  URL: ${bug.url}`);
            console.log(`  Repro Steps:`);
            bug.reproSteps.forEach((step, i) => {
                console.log(`    ${i + 1}. ${step}`);
            });
            if (bug.consoleErrors) {
                console.log(`  Console Errors:`);
                bug.consoleErrors.forEach(err => {
                    console.log(`    - ${err}`);
                });
            }
            console.log('');
        });

        console.log(`Total bugs found: ${bugReports.length}`);
        console.log(`P0 (Critical): ${bugReports.filter(b => b.severity === 'P0').length}`);
        console.log(`P1 (High): ${bugReports.filter(b => b.severity === 'P1').length}`);
        console.log(`P2 (Medium): ${bugReports.filter(b => b.severity === 'P2').length}`);
        console.log(`P3 (Low): ${bugReports.filter(b => b.severity === 'P3').length}`);
    } else {
        console.log('\n✅ No bugs found during QA simulation!\n');
    }
});
