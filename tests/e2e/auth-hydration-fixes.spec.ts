import { test, expect } from '@playwright/test';

test.describe('Avyakta Auth & Hydration Bug Fixes Regression Suite', () => {
  test('Bug One & Two: No React render-phase router errors or hydration mismatches on Dashboard', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // 1. Visit Dashboard (Guest mode)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify no hydration errors
    const hydrationErrors = consoleErrors.filter(
      (err) =>
        err.includes('Hydration failed') ||
        err.includes('did not match') ||
        err.includes('server rendered')
    );
    expect(hydrationErrors).toEqual([]);

    // 2. Visit Login page as guest (no render phase router updates)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const routerErrors = consoleErrors.filter(
      (err) =>
        err.includes("Cannot update a component ('Router')") ||
        err.includes('while rendering a different component')
    );
    expect(routerErrors).toEqual([]);

    // 3. Visit Signup page as guest
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const signupRouterErrors = consoleErrors.filter(
      (err) =>
        err.includes("Cannot update a component ('Router')") ||
        err.includes('while rendering a different component')
    );
    expect(signupRouterErrors).toEqual([]);
  });

  test('Bug Two: Journey page and Chapter view render cleanly without hydration mismatch', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit Journey
    await page.goto('/journey');
    await page.waitForLoadState('networkidle');

    // Visit Chapter 1
    await page.goto('/journey/chapter/1');
    await page.waitForLoadState('networkidle');

    const hydrationErrors = consoleErrors.filter(
      (err) =>
        err.includes('Hydration failed') ||
        err.includes('did not match') ||
        err.includes('server rendered')
    );
    expect(hydrationErrors).toEqual([]);
  });

  const testViewports = [
    { name: 'Mobile 320px', width: 320, height: 600, isDesktop: false },
    { name: 'Mobile 375px', width: 375, height: 667, isDesktop: false },
    { name: 'Mobile 425px', width: 425, height: 800, isDesktop: false },
    { name: 'Tablet 768px', width: 768, height: 1024, isDesktop: false },
    { name: 'Laptop 1024px', width: 1024, height: 768, isDesktop: false },
    { name: 'Desktop 1280px (xl)', width: 1280, height: 800, isDesktop: true },
    { name: 'Desktop 1366px', width: 1366, height: 768, isDesktop: true },
    { name: 'Desktop 1440px', width: 1440, height: 900, isDesktop: true },
    { name: 'Desktop 1536px (2xl breakpoint)', width: 1536, height: 864, isDesktop: true },
    { name: 'Desktop 1920px (FHD)', width: 1920, height: 1080, isDesktop: true },
  ];

  for (const vp of testViewports) {
    test(`Bug Three: Navbar layout integrity at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll on page
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      if (!vp.isDesktop) {
        // Mobile/Tablet menu button should be visible
        const mobileMenuBtn = page.getByRole('button', { name: /open navigation menu/i });
        await expect(mobileMenuBtn).toBeVisible();

        // Clicking hamburger menu opens drawer with login and signup
        await mobileMenuBtn.click();
        const drawerLogin = page.locator('#mobile-drawer a[href="/login"]');
        const drawerSignup = page.locator('#mobile-drawer a[href="/signup"]');
        await expect(drawerLogin).toBeVisible();
        await expect(drawerSignup).toBeVisible();
      } else {
        // Desktop nav links and Auth buttons (Login/Sign Up) should be visible
        const loginLink = page.locator('header a[href="/login"]');
        const signupLink = page.locator('header a[href="/signup"]');
        await expect(loginLink).toBeVisible();
        await expect(signupLink).toBeVisible();

        // Check bounding box of Login and Sign Up are within viewport
        const loginBox = await loginLink.boundingBox();
        const signupBox = await signupLink.boundingBox();
        expect(loginBox).not.toBeNull();
        expect(signupBox).not.toBeNull();

        if (loginBox && signupBox) {
          expect(loginBox.x + loginBox.width).toBeLessThanOrEqual(vp.width);
          expect(signupBox.x + signupBox.width).toBeLessThanOrEqual(vp.width);
        }
      }
    });
  }
});
