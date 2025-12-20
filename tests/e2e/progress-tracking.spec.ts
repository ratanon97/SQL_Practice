import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Master SQL');
	});

	test('should display progress dashboard', async ({ page }) => {
		await expect(page.locator('text=Progress')).toBeVisible();
	});

	test('should show completion percentage', async ({ page }) => {
		await expect(page.locator('text=Completion')).toBeVisible();

		// Should show a percentage (0-100%)
		const percentage = page.locator('text=/\\d+%/').first();
		await expect(percentage).toBeVisible();
	});

	test('should show points counter', async ({ page }) => {
		await expect(page.locator('text=Points')).toBeVisible();

		// Points should be a number
		const points = page.locator('[aria-label*="points"]');
		await expect(points).toBeVisible();
	});

	test('should show streak counter', async ({ page }) => {
		await expect(page.locator('text=/Day streak|Streak/i')).toBeVisible();

		// Streak should include fire emoji or number
		const streak = page.locator('text=/🔥|\\d+/').first();
		await expect(streak).toBeVisible();
	});

	test('should show progress stats in header', async ({ page }) => {
		// All three stats should be in the header
		const stats = page.locator('header').first();
		await expect(stats.locator('text=/\\d+%/')).toBeVisible(); // Completion
		await expect(stats.locator('text=Points')).toBeVisible();
	});

	test('should persist progress across page reloads', async ({ page }) => {
		// Wait for page to load
		await page.waitForTimeout(1000);

		// Get initial completion rate
		const completionText = await page.locator('[aria-label*="completed"]').textContent();

		// Reload page
		await page.reload();
		await expect(page.locator('h1')).toContainText('Master SQL');

		// Wait for reload
		await page.waitForTimeout(1000);

		// Completion rate should be the same
		const newCompletionText = await page.locator('[aria-label*="completed"]').textContent();
		expect(newCompletionText).toBe(completionText);
	});
});
