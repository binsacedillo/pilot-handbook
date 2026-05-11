import { test, expect } from '@playwright/test';

test.describe('Infrastructure Validation', () => {
  test('Phase 1: homepage loads and renders heading', async ({ page }) => {
    // Navigate to the root with a generous timeout for CI cold starts
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

    // Verify basic connectivity and title
    await expect(page).toHaveTitle(/Pilot Handbook/i);

    // Verify main heading is visible - NO auth, NO redirects expected
    const heading = page.getByRole('heading', { name: /Your Flight Hours/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
