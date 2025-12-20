import { test, expect } from '@playwright/test';

test.describe('Schema Explorer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Master SQL');
	});

	test('should display schema explorer', async ({ page }) => {
		await expect(page.locator('text=Schema')).toBeVisible();
		await expect(page.locator('text=PGlite in-browser')).toBeVisible();
	});

	test('should show current database name', async ({ page }) => {
		// Should show one of the database names
		const dbName = page.locator('text=/Employees DB|Ecommerce DB|Movies DB/i');
		await expect(dbName).toBeVisible();
	});

	test('should display table information', async ({ page }) => {
		// Wait for schema to load
		await page.waitForTimeout(500);

		// Should have at least one table listed
		const tables = page.locator('[role="list"] [role="listitem"]').first();
		await expect(tables).toBeVisible();
	});

	test('should show column count for tables', async ({ page }) => {
		await page.waitForTimeout(500);

		// Look for column count indicator (e.g., "5 cols")
		const columnCount = page.locator('text=/\\d+ cols/i').first();
		await expect(columnCount).toBeVisible();
	});

	test('should display column names', async ({ page }) => {
		await page.waitForTimeout(500);

		// Columns should be rendered
		const hasColumns = await page.locator('[role="list"] [role="listitem"]').count();
		expect(hasColumns).toBeGreaterThan(0);
	});

	test('schema should update when switching difficulties', async ({ page }) => {
		// Switch to intermediate difficulty
		await page.getByRole('tab', { name: 'intermediate' }).click();

		// Schema should still be visible
		await expect(page.locator('text=Schema')).toBeVisible();
		await expect(page.locator('text=/Employees DB|Ecommerce DB|Movies DB/i')).toBeVisible();
	});
});
