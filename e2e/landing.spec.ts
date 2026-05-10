import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout for cold-starts in CI
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  });

  test('should render the marketing headline and main CTA', async ({ page }) => {
    // 1. Verify page title for basic connectivity
    await expect(page).toHaveTitle(/Pilot Handbook/i);

    // 2. Check for the main heading (using role for stability)
    // We use .first() because the text might be split or duplicated in mobile/desktop views
    const heading = page.getByRole('heading', { name: /Your Flight Hours/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // 3. Check for the primary CTA button
    const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
    await expect(getStartedBtn).toBeVisible();
    await expect(getStartedBtn).toHaveAttribute('class', /bg-blue-600/); // Verify it's the primary button
  });

  test('should have a functional navigation bar', async ({ page }) => {
    // Check for the brand name in the nav
    const brand = page.locator('nav').getByText(/Pilot Handbook/i);
    await expect(brand).toBeVisible();

    // Verify presence of Sign In link
    const signInLink = page.getByRole('link', { name: /Sign In/i }).first();
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  test('should show CAAP compliance badges', async ({ page }) => {
    // These badges prove the marketing content rendered
    const badge = page.getByText(/CAAP Standard/i);
    await expect(badge).toBeVisible();
  });
});
