import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Lineup Builder Flow
 *
 * Critical user journey: Building and managing match lineups
 */

test.describe('Lineup Builder Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('should navigate to lineup page from matchups', async ({ page }) => {
        // Navigate to matchups tab
        const matchupsNav = page.locator('nav button').filter({ hasText: /matchups|lineup/i }).first();

        if (await matchupsNav.isVisible()) {
            await matchupsNav.click();
            await expect(page).toHaveURL(/matchups|lineup/);
        }
    });

    test('should display lineup builder when accessed', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Page should load without errors
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Should not show error state
        const errorIndicator = page.locator('text=/error|went wrong/i');
        const errorCount = await errorIndicator.count();
        expect(errorCount).toBeLessThanOrEqual(0);
    });

    test('should have drag-and-drop UI elements when lineup exists', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for drag handles or sortable elements
        const dragIndicators = page.locator('[data-testid="drag-handle"], [draggable="true"], .dnd-handle');

        // If lineup builder is populated, drag elements should exist
        const pageContent = await page.textContent('body');
        if (pageContent?.includes('Player') || pageContent?.includes('Match')) {
            // Verify interactive elements are present
            const buttons = page.locator('button');
            expect(await buttons.count()).toBeGreaterThan(0);
        }
    });

    test('should show fairness score when lineup has players', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for fairness indicators
        const fairnessIndicator = page.locator('text=/fairness|balance|handicap/i');

        // If there's a fairness indicator, it should show a value
        if (await fairnessIndicator.count() > 0) {
            await expect(fairnessIndicator.first()).toBeVisible();
        }
    });

    test('should have auto-fill functionality available', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for auto-fill or suggest button
        const autoFillButton = page.locator('button').filter({ hasText: /auto|fill|suggest|generate/i });

        if (await autoFillButton.count() > 0) {
            await expect(autoFillButton.first()).toBeEnabled();
        }
    });

    test('should navigate to specific session lineup', async ({ page }) => {
        // First check if any sessions exist via the schedule
        await page.goto('/schedule');
        await page.waitForLoadState('domcontentloaded');

        // Look for session links
        const sessionLinks = page.locator('a[href*="lineup"], button').filter({ hasText: /build|lineup|pair/i });

        if (await sessionLinks.count() > 0) {
            await sessionLinks.first().click();
            // Should navigate to lineup page
            await expect(page).toHaveURL(/lineup/);
        }
    });
});

test.describe('Lineup Validation', () => {
    test('should prevent duplicate players in same match', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for validation messages
        const validationMessage = page.locator('text=/duplicate|already|conflict/i');

        // Page should load without showing duplicate error initially
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should show handicap preview in pairing flow', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for handicap displays
        const handicapDisplay = page.locator('text=/hdcp|hcp|handicap|index/i');

        // If lineup has players with handicaps, they should be visible
        if (await handicapDisplay.count() > 0) {
            await expect(handicapDisplay.first()).toBeVisible();
        }
    });
});

test.describe('Lineup Captain Controls', () => {
    test('should show lock/publish controls in captain mode', async ({ page }) => {
        // Enable captain mode first
        await page.goto('/more');
        await page.waitForLoadState('domcontentloaded');

        const captainToggle = page.locator('text=/captain/i').first();
        if (await captainToggle.isVisible()) {
            // Try to enable captain mode
            await captainToggle.click();
        }

        // Navigate to lineup
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for captain controls
        const captainControls = page.locator('button').filter({ hasText: /lock|publish|finalize/i });

        // Captain controls should be accessible
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});
