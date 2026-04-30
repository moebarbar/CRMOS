import { test, expect } from '@playwright/test';

test('marketing landing renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/whole business/i);
  await expect(page.getByRole('link', { name: /start free/i })).toBeVisible();
});

test('protected route redirects unauthed users', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveURL(/sign-in/);
});
