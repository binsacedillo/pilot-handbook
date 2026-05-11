import { test, expect } from '@playwright/test';

test.describe('Infrastructure Validation', () => {
  test('Phase 1: homepage loads and renders heading', async ({ page }) => {
    // Debug: Log all responses to catch protocol upgrades or HSTS headers
    page.on('response', async (response) => {
      const status = response.status();
      const url = response.url();
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        console.log(`[Response] ${status} ${url}`);
        const headers = await response.allHeaders();
        if (headers['strict-transport-security'] || headers['location']) {
          console.log(`⚠️ Potential Redirect/HSTS:`, JSON.stringify(headers, null, 2));
        }
      }
    });

    // Navigate to the root with 'load' instead of 'networkidle'
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    // Verify basic connectivity and title
    await expect(page).toHaveTitle(/Pilot Handbook/i);

    // Verify main heading is visible - NO auth, NO redirects expected
    const heading = page.getByRole('heading', { name: /Your Flight Hours/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
