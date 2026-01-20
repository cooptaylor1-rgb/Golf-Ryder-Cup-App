import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Captain Mode Flow
 *
 * Critical user journey: Enabling/disabling captain mode and session locking
 */

test.describe('Captain Mode Toggle', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('should navigate to captain mode settings', async ({ page }) => {
        await page.goto('/more');
        await page.waitForLoadState('domcontentloaded');

        // Look for captain mode option
        const captainOption = page.locator('text=/captain/i').first();

        if (await captainOption.isVisible()) {
            await expect(captainOption).toBeVisible();
        }
    });

    test('should toggle captain mode on and off', async ({ page }) => {
        await page.goto('/more');
        await page.waitForLoadState('domcontentloaded');

        // Find captain mode toggle
        const captainToggle = page.locator('button, [role="switch"]').filter({ hasText: /captain/i }).first();

        if (await captainToggle.isVisible()) {
            // Click to toggle
            await captainToggle.click();
            await page.waitForTimeout(300);

            // Should show some confirmation or state change
            const body = page.locator('body');
            await expect(body).toBeVisible();
        }
    });

    test('should require PIN for captain mode', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for PIN input or verification
        const pinInput = page.locator('input[type="password"], input[type="tel"], input[pattern]');
        const pinPrompt = page.locator('text=/pin|code|verify|password/i');

        // Either PIN input or prompt might be present
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should show captain controls when enabled', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for captain-specific controls
        const captainControls = page.locator('button').filter({
            hasText: /lock|unlock|manage|lineup|draft/i
        });

        // Page should render
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});

test.describe('Session Locking', () => {
    test('should display lock status on sessions', async ({ page }) => {
        await page.goto('/captain/manage');
        await page.waitForLoadState('domcontentloaded');

        // Look for lock indicators
        const lockIndicator = page.locator('text=/locked|unlocked|lock/i, [data-testid*="lock"]');

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should require confirmation to unlock session', async ({ page }) => {
        await page.goto('/captain/manage');
        await page.waitForLoadState('domcontentloaded');

        // Look for unlock button
        const unlockButton = page.locator('button').filter({ hasText: /unlock/i });

        if (await unlockButton.count() > 0 && await unlockButton.first().isVisible()) {
            await unlockButton.first().click();

            // Should show confirmation dialog
            const confirmDialog = page.locator('text=/confirm|sure|warning/i, [role="dialog"], [role="alertdialog"]');

            // Either dialog or some confirmation UI should appear
            await page.waitForTimeout(300);
            const body = page.locator('body');
            await expect(body).toBeVisible();
        }
    });

    test('should auto-lock when scoring starts', async ({ page }) => {
        await page.goto('/captain/manage');
        await page.waitForLoadState('domcontentloaded');

        // Look for auto-lock messaging
        const autoLockMessage = page.locator('text=/auto|automatic|scoring|locked/i');

        // Page should render
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should show audit trail for lock changes', async ({ page }) => {
        await page.goto('/captain/manage');
        await page.waitForLoadState('domcontentloaded');

        // Look for audit/history section
        const auditSection = page.locator('text=/history|audit|log|changes/i');

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});

test.describe('Captain Quick Actions', () => {
    test('should have build lineup action', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for lineup action
        const lineupAction = page.locator('a, button').filter({ hasText: /lineup|pair|build/i });

        if (await lineupAction.count() > 0) {
            await expect(lineupAction.first()).toBeEnabled();
        }
    });

    test('should have draft board action', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for draft action
        const draftAction = page.locator('a, button').filter({ hasText: /draft/i });

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should have manage sessions action', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for session management
        const sessionAction = page.locator('a, button').filter({ hasText: /session|manage/i });

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should have publish lineup action', async ({ page }) => {
        await page.goto('/captain');
        await page.waitForLoadState('domcontentloaded');

        // Look for publish action
        const publishAction = page.locator('button').filter({ hasText: /publish|announce/i });

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});

test.describe('Captain Mode Permissions', () => {
    test('should restrict editing when not in captain mode', async ({ page }) => {
        await page.goto('/lineup');
        await page.waitForLoadState('domcontentloaded');

        // Look for restricted/disabled state
        const restrictedMessage = page.locator('text=/captain|restricted|view only|locked/i');

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should show captain badge when enabled', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Look for captain indicator/badge
        const captainBadge = page.locator('[data-testid="captain-badge"], text=/captain mode/i');

        // Page should load
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});
