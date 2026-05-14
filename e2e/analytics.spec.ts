import { test, expect } from '@playwright/test';

test.describe('Analytics Module Validation', () => {
  test('Phase 2: analytics page renders with pro-grade layout', async ({ page }) => {
    // Navigate to analytics - should bypass auth due to NEXT_PUBLIC_E2E=true
    await page.goto('/analytics', { waitUntil: 'load', timeout: 30000 });

    // Verify the "Pro-Grade" Header typography exists
    const heading = page.getByRole('heading', { name: /FLIGHT DATA ANALYSIS/i });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify Telemetry Status indicator
    const telemetry = page.getByText(/Telemetry Active/i);
    await expect(telemetry).toBeVisible();

    // Verify charts container - Wait for Suspense to finish
    // We look for the "Monthly Progression" label which is inside the AnalyticsClient
    const monthlyProgression = page.getByText(/Monthly Progression/i);
    await expect(monthlyProgression).toBeVisible({ timeout: 15000 });

    // Verify the AppHeader is present
    const brand = page.getByText(/Pilot Handbook/i);
    await expect(brand).toBeVisible();
  });
});
