import { test, expect } from '@playwright/test';

test.describe('Tools Workflow Validation', () => {
  test('Phase 3: preflight tools dashboard and workflow initialization', async ({ page }) => {
    // Navigate to tools - should bypass auth due to NEXT_PUBLIC_E2E=true
    await page.goto('/tools', { waitUntil: 'load', timeout: 30000 });

    // 1. Verify Pro-Grade Header
    const heading = page.getByRole('heading', { name: /FLIGHT PREPARATION/i });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 2. Verify Safety Protocol Banner
    const safetyNotice = page.getByText(/Safety Notice/i);
    await expect(safetyNotice).toBeVisible();
    
    const afmText = page.getByText(/certified flight manual \(AFM\)/i);
    await expect(afmText).toBeVisible();

    // 3. Verify Workflow Stepper Initialization
    // The first step should be "AIRCRAFT"
    const aircraftStep = page.getByText(/Aircraft Selection/i).first();
    await expect(aircraftStep).toBeVisible();

    // 4. Verify System Ready Status
    const systemStatus = page.getByText(/System Ready/i);
    await expect(systemStatus).toBeVisible();

    // 5. Verify AppHeader integration
    const brand = page.getByRole('link', { name: /Pilot Handbook/i }).first();
    await expect(brand).toBeVisible();
  });
});
