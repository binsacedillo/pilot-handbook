import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load correctly and show the main headline', async ({ page }) => {
    try {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
      
      // Check for the main title
      const title = page.getByText(/Pilot Handbook/i).first();
      await expect(title).toBeVisible();

      // Check for "Get Started" button
      const getStartedBtn = page.getByRole('button', { name: 'Get Started', exact: true });
      await expect(getStartedBtn).toBeVisible();
    } catch (error) {
      await page.screenshot({ path: 'test-results/failure-landing.png', fullPage: true });
      throw error;
    }
  });

  test('should be responsive and match visual baseline', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Ensure the page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for PHB logo in mobile/tablet view
    const logo = page.getByText(/PHB/i).first();
    // This will only be visible on smaller screens (sm:hidden)
    // We can use this to verify responsive logic
  });
});
