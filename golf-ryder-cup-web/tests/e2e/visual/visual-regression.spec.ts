/**
 * Visual Regression Tests
 *
 * Playwright-based screenshot comparison tests for critical UI components.
 * Captures screenshots and compares against baseline images.
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================
// TEST CONFIGURATION
// ============================================

const VIEWPORT = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

const THEMES = ['light', 'dark'] as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((t) => {
    document.documentElement.classList.remove('light', 'dark', 'outdoor');
    document.documentElement.classList.add(t);
  }, theme);
}

async function waitForPageReady(page: Page): Promise<void> {
  // Wait for any loading skeletons to disappear
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to settle
}

// ============================================
// VISUAL REGRESSION TESTS
// ============================================

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('home page - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('home-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('home page - tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.tablet);
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('home-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('home page - desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.desktop);
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('home-desktop.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('home page - dark mode', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/');
      await setTheme(page, 'dark');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('home-mobile-dark.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Standings Page', () => {
    test('standings page - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/standings');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('standings-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('standings page - desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.desktop);
      await page.goto('/standings');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('standings-desktop.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Live Matches Page', () => {
    test('live matches - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/live');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('live-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('live matches - desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.desktop);
      await page.goto('/live');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('live-desktop.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Players Page', () => {
    test('players list - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/players');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('players-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Profile Page', () => {
    test('profile - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/profile');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('profile-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Settings Page', () => {
    test('settings - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/settings');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('settings-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('UI Components', () => {
    test('buttons - all variants', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      // Navigate to a page with buttons or create a test page
      await page.goto('/');
      await waitForPageReady(page);

      // Screenshot just the bottom navigation for button examples
      const nav = page.locator('nav').first();
      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot('nav-buttons.png', {
          animations: 'disabled',
        });
      }
    });

    test('cards - match cards', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/matchups');
      await waitForPageReady(page);

      const matchCard = page.locator('[data-testid="match-card"]').first();
      if (await matchCard.isVisible()) {
        await expect(matchCard).toHaveScreenshot('match-card.png', {
          animations: 'disabled',
        });
      }
    });

    test('empty states', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      // A page that might show empty state
      await page.goto('/standings');
      await waitForPageReady(page);

      const emptyState = page.locator('[data-testid="empty-state"]').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toHaveScreenshot('empty-state.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Error States', () => {
    test('404 page', async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/nonexistent-page');
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'xs', width: 320 },
      { name: 'sm', width: 640 },
      { name: 'md', width: 768 },
      { name: 'lg', width: 1024 },
      { name: 'xl', width: 1280 },
    ];

    for (const bp of breakpoints) {
      test(`home page at ${bp.name} (${bp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: 800 });
        await page.goto('/');
        await waitForPageReady(page);
        await expect(page).toHaveScreenshot(`home-${bp.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });
});

// ============================================
// THEME COMPARISON TESTS
// ============================================

test.describe('Theme Comparison', () => {
  for (const theme of THEMES) {
    test(`home page - ${theme} theme`, async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/');
      await setTheme(page, theme);
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot(`home-${theme}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`standings - ${theme} theme`, async ({ page }) => {
      await page.setViewportSize(VIEWPORT.mobile);
      await page.goto('/standings');
      await setTheme(page, theme);
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot(`standings-${theme}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});
