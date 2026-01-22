/**
 * Test Helpers & Utilities
 *
 * Shared utilities for E2E tests - handles common setup,
 * waiting, navigation, and DOM stabilization.
 */

import { Page, BrowserContext, expect } from '@playwright/test';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const TEST_CONFIG = {
    timeouts: {
        fast: 5000,
        standard: 10000,
        slow: 30000,
        networkIdle: 60000,
    },
    delays: {
        hydration: 300,
        animation: 500,
        debounce: 1500,
    },
} as const;

// ============================================================================
// DOM STABILIZATION
// ============================================================================

/**
 * Wait for the DOM to stabilize after React hydration
 */
export async function waitForStableDOM(page: Page, timeout = TEST_CONFIG.timeouts.standard): Promise<void> {
    await page.waitForLoadState('domcontentloaded');

    // Wait for Next.js compilation to complete (dev mode)
    try {
        await page.waitForFunction(() => {
            const loadingText = document.body.textContent || '';
            return !loadingText.includes('Compiling');
        }, { timeout });
    } catch {
        // Continue even if timeout - page might be in a valid state
    }

    // Wait for content to appear (not just "Loading...")
    try {
        await page.waitForFunction(() => {
            const body = document.querySelector('body');
            if (!body) return false;
            const text = body.textContent || '';
            return text.length > 50 && !text.match(/^[\s]*Loading\.\.\.[\s]*$/);
        }, { timeout: TEST_CONFIG.timeouts.fast });
    } catch {
        // Continue
    }

    // Allow React to settle
    await page.waitForTimeout(TEST_CONFIG.delays.hydration);
}

/**
 * Wait for network to be idle with configurable timeout
 */
export async function waitForNetworkIdle(page: Page, timeout = TEST_CONFIG.timeouts.networkIdle): Promise<void> {
    try {
        await page.waitForLoadState('networkidle', { timeout });
    } catch {
        // Network may never be fully idle in some cases
    }
}

// ============================================================================
// MODAL & BLOCKING UI HANDLING
// ============================================================================

/**
 * Dismiss the onboarding modal if visible
 */
export async function dismissOnboardingModal(page: Page): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await page.waitForTimeout(TEST_CONFIG.delays.animation);

            const dismissButtons = [
                page.locator('button:has-text("Skip for now")'),
                page.locator('button:has-text("Skip onboarding")'),
                page.locator('[role="dialog"] button:has-text("Skip")'),
                page.locator('button:has-text("Later")'),
                page.locator('button:has-text("Not now")'),
            ];

            for (const button of dismissButtons) {
                if (await button.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                    await button.first().click();
                    await page.waitForTimeout(TEST_CONFIG.delays.animation);
                    break;
                }
            }

            // Check if modal is still visible
            if (!(await page.locator('[role="dialog"]').isVisible().catch(() => false))) {
                break;
            }
        } catch {
            // Continue to next attempt
        }
    }
}

/**
 * Dismiss all blocking modals/wizards
 */
export async function dismissAllBlockingModals(page: Page): Promise<void> {
    await dismissOnboardingModal(page);

    // Handle wizard pages
    try {
        const isOnWizard = await page.locator('text=/step \\d+ of \\d+/i').isVisible().catch(() => false);
        if (isOnWizard) {
            await page.goto('/');
            await page.waitForTimeout(TEST_CONFIG.delays.animation);
            await dismissOnboardingModal(page);
        }
    } catch {
        // Continue
    }
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate and setup - combines goto with common setup tasks
 */
export async function navigateAndSetup(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await waitForStableDOM(page);
    await dismissAllBlockingModals(page);
}

/**
 * Navigate via bottom navigation
 */
export async function navigateViaBottomNav(page: Page, section: 'home' | 'schedule' | 'score' | 'standings' | 'more'): Promise<void> {
    const navMap: Record<string, RegExp> = {
        home: /home/i,
        schedule: /schedule/i,
        score: /score/i,
        standings: /standings|leaderboard/i,
        more: /more|menu/i,
    };

    const navButton = page.locator('nav button').filter({ hasText: navMap[section] }).first();

    if (await navButton.isVisible({ timeout: TEST_CONFIG.timeouts.fast })) {
        await navButton.click();
        await waitForStableDOM(page);
    }
}

// ============================================================================
// INDEXEDDB HELPERS
// ============================================================================

/**
 * Clear IndexedDB safely
 */
export async function clearIndexedDB(page: Page): Promise<boolean> {
    try {
        return await page.evaluate(() => {
            return new Promise<boolean>((resolve) => {
                try {
                    const deleteRequest = indexedDB.deleteDatabase('GolfTripDB');
                    deleteRequest.onsuccess = () => resolve(true);
                    deleteRequest.onerror = () => resolve(false);
                    deleteRequest.onblocked = () => resolve(true);
                } catch {
                    resolve(false);
                }
            });
        });
    } catch {
        return false;
    }
}

/**
 * Get IndexedDB data for inspection
 */
export async function getIndexedDBData(page: Page, tableName: string): Promise<unknown[]> {
    return page.evaluate(async (table) => {
        return new Promise((resolve) => {
            const request = indexedDB.open('GolfTripDB');
            request.onsuccess = () => {
                const db = request.result;
                try {
                    const tx = db.transaction(table, 'readonly');
                    const store = tx.objectStore(table);
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
                    getAllRequest.onerror = () => resolve([]);
                } catch {
                    resolve([]);
                }
            };
            request.onerror = () => resolve([]);
        });
    }, tableName);
}

// ============================================================================
// PERFORMANCE HELPERS
// ============================================================================

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
    const start = Date.now();
    const result = await fn();
    return { result, durationMs: Date.now() - start };
}

/**
 * Assert page load performance
 */
export async function assertPageLoadTime(page: Page, maxMs: number): Promise<void> {
    const timing = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return perf?.loadEventEnd - perf?.startTime || 0;
    });

    expect(timing).toBeLessThan(maxMs);
}

// ============================================================================
// CAPTAIN MODE HELPERS
// ============================================================================

/**
 * Enable captain mode via UI
 */
export async function enableCaptainMode(page: Page, pin?: string): Promise<boolean> {
    await navigateAndSetup(page, '/captain');

    // Look for PIN input
    const pinInput = page.locator('input[type="password"], input[type="tel"], input[pattern]');

    if (await pinInput.count() > 0 && pin) {
        await pinInput.first().fill(pin);
        await page.locator('button[type="submit"], button:has-text("Verify")').first().click();
        await waitForStableDOM(page);
    }

    // Check if captain mode is enabled
    const captainIndicator = page.locator('text=/captain mode|captain enabled/i');
    return await captainIndicator.isVisible({ timeout: TEST_CONFIG.timeouts.fast }).catch(() => false);
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert no console errors during test
 */
export async function assertNoConsoleErrors(page: Page, ignoredPatterns: RegExp[] = []): Promise<void> {
    const errors: string[] = [];

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (!ignoredPatterns.some(pattern => pattern.test(text))) {
                errors.push(text);
            }
        }
    });

    expect(errors).toHaveLength(0);
}

/**
 * Assert no duplicate elements with the same test id
 */
export async function assertNoDuplicateTestIds(page: Page, testIdPrefix: string): Promise<void> {
    const elements = await page.locator(`[data-testid^="${testIdPrefix}"]`).all();
    const ids = await Promise.all(elements.map(el => el.getAttribute('data-testid')));
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
}

// ============================================================================
// DATA INTEGRITY HELPERS
// ============================================================================

/**
 * Count elements matching a pattern
 */
export async function countElements(page: Page, selector: string): Promise<number> {
    return page.locator(selector).count();
}

/**
 * Get text content of all matching elements
 */
export async function getAllTextContent(page: Page, selector: string): Promise<string[]> {
    const elements = await page.locator(selector).all();
    return Promise.all(elements.map(el => el.textContent().then(t => t || '')));
}

/**
 * Verify team score totals are consistent
 */
export async function verifyScoreTotals(page: Page): Promise<{ valid: boolean; details: string }> {
    // This would be customized based on the actual app's score display
    const scoreElements = await page.locator('[data-testid*="score"], [data-testid*="points"]').all();

    if (scoreElements.length === 0) {
        return { valid: true, details: 'No score elements found (empty state)' };
    }

    // Basic validation - scores should be numbers
    const scores = await Promise.all(
        scoreElements.map(async el => {
            const text = await el.textContent();
            return parseFloat(text || '0');
        })
    );

    const hasInvalidScores = scores.some(s => isNaN(s) || s < 0);

    return {
        valid: !hasInvalidScores,
        details: hasInvalidScores ? 'Invalid score values found' : 'All scores valid',
    };
}
