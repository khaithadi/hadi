import { test, expect } from '@playwright/test';

// Happy-path smoke: discover → open a listing → reach the booking widget.
test('guest can browse and reach a listing', async ({ page }) => {
  await page.goto('/ar');
  await expect(page.locator('h1')).toBeVisible();

  // Featured listings render.
  const firstCard = page.locator('a[href*="/listing/"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  // Listing detail shows the reserve/request action.
  await expect(page.getByRole('button', { name: /احجز|اطلب|Reserve|Request/ })).toBeVisible();
});

test('login page exposes demo accounts', async ({ page }) => {
  await page.goto('/ar/login');
  await expect(page.getByText(/guest@nuzul.dz/)).toBeVisible();
});
