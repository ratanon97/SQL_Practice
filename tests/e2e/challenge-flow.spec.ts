import { test, expect } from '@playwright/test';

test.describe('Challenge Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for the page to be fully loaded
		await expect(page.locator('h1')).toContainText('Master SQL');
	});

	test('should display challenge editor with starter SQL', async ({ page }) => {
		await expect(page.locator('text=Challenge')).toBeVisible();
		// Wait for CodeMirror editor to load
		await page.waitForSelector('.cm-editor', { timeout: 5000 });
		await expect(page.locator('.cm-editor')).toBeVisible();
	});

	test('should run a simple SQL query and see results', async ({ page }) => {
		// Wait for the editor to load
		await page.waitForSelector('.cm-editor', { timeout: 5000 });

		// Click the Run & Validate button
		const runButton = page.getByRole('button', { name: /Run & Validate/i });
		await expect(runButton).toBeEnabled();
		await runButton.click();

		// Wait for results to appear (with generous timeout for PGlite initialization)
		await page.waitForTimeout(2000);

		// Check for either success message or results table
		const hasResults = await page.locator('text=/Your query result|Result differs/i').isVisible();
		expect(hasResults).toBe(true);
	});

	test('should reset SQL to starter template', async ({ page }) => {
		await page.waitForSelector('.cm-editor', { timeout: 5000 });

		// Click Reset button
		const resetButton = page.getByRole('button', { name: /Reset/i });
		await resetButton.click();

		// Editor should still be visible after reset
		await expect(page.locator('.cm-editor')).toBeVisible();
	});

	test('should switch between challenges', async ({ page }) => {
		await page.waitForSelector('.cm-editor', { timeout: 5000 });

		// Get all challenge buttons/cards (they should be clickable)
		const challengeCards = page.locator('[role="listitem"]').first();
		await challengeCards.click();

		// Challenge editor should still be visible
		await expect(page.locator('text=Challenge')).toBeVisible();
	});

	test('should display validation status after running query', async ({ page }) => {
		await page.waitForSelector('.cm-editor', { timeout: 5000 });

		// Run the default query
		const runButton = page.getByRole('button', { name: /Run & Validate/i });
		await runButton.click();

		// Wait for validation status
		await page.waitForTimeout(2000);

		// Should show either "Validation passed" or "Result differs"
		const validationStatus = page.locator('text=/Validation passed|Result differs/i');
		await expect(validationStatus).toBeVisible();
	});

	test('should show execution time after query runs', async ({ page }) => {
		await page.waitForSelector('.cm-editor', { timeout: 5000 });

		const runButton = page.getByRole('button', { name: /Run & Validate/i });
		await runButton.click();

		await page.waitForTimeout(2000);

		// Look for milliseconds indicator (e.g., "123 ms")
		const timeIndicator = page.locator('text=/\\d+ ms/i');
		await expect(timeIndicator).toBeVisible();
	});
});
