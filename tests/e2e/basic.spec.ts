import { test, expect } from '@playwright/test';

test.describe('SQL Dojo', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Master SQL');
	});

	test('should display difficulty tabs', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('tab', { name: 'beginner' })).toBeVisible();
		await expect(page.getByRole('tab', { name: 'intermediate' })).toBeVisible();
		await expect(page.getByRole('tab', { name: 'advanced' })).toBeVisible();
	});

	test('should switch between difficulties', async ({ page }) => {
		await page.goto('/');

		// Click intermediate tab
		await page.getByRole('tab', { name: 'intermediate' }).click();
		await expect(page.getByRole('tab', { name: 'intermediate' })).toHaveAttribute(
			'aria-selected',
			'true'
		);

		// Click advanced tab
		await page.getByRole('tab', { name: 'advanced' }).click();
		await expect(page.getByRole('tab', { name: 'advanced' })).toHaveAttribute(
			'aria-selected',
			'true'
		);
	});

	test('should display progress dashboard', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('text=Progress')).toBeVisible();
		await expect(page.locator('text=Completion')).toBeVisible();
		await expect(page.locator('text=Points')).toBeVisible();
		await expect(page.locator('text=Streak')).toBeVisible();
	});

	test('should have playground section', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('text=Playground')).toBeVisible();
		await expect(page.locator('text=Free SQL practice')).toBeVisible();
	});

	test('should have schema explorer', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('text=Schema')).toBeVisible();
		await expect(page.locator('text=PGlite in-browser')).toBeVisible();
	});
});
