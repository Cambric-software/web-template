const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('homepage renders its website shell and favicon', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#product-name')).toBeVisible();
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', './index/assets/cambric-logo.png');
    await expect(page.locator('.site-nav')).toBeVisible();
});

test('version is displayed in footer', async ({ page }) => {
    await page.goto('/');
    // Wait for the version script to populate the element
    // Increase timeout to 60 seconds for slow initial loads
    await page.waitForFunction(() => {
        const el = document.querySelector('[data-cambric-version]');
        return el && el.textContent.trim() !== '...' && el.textContent.trim() !== '';
    }, { timeout: 60000 });
    const versionText = await page.locator('[data-cambric-version]').textContent();
    // Should be a semver string like "1.0.1"
    expect(versionText).toMatch(/\d+\.\d+\.\d+/);
});

test('theme toggle persists and contact validation is accessible', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.locator('[data-contact-form] button[type="submit"]').click();
    await expect(page.locator('[data-form-status]')).toHaveText('Please check the highlighted fields.');
    await expect(page.locator('[data-error-for="email"]')).toHaveText('Please enter a valid email address.');
});

test('language switcher switches to Arabic and back', async ({ page }) => {
    await page.goto('/');
    // Use .first() to handle strict mode when multiple language toggles exist (e.g., header + mobile menu)
    const langBtn = page.locator('[data-language-toggle]').first();
    await expect(langBtn).toBeVisible();
    // Switch to Arabic — button should now say "English"
    await langBtn.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(langBtn).toHaveText('English');
    // Switch back
    await langBtn.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('components page loads with content', async ({ page }) => {
    await page.goto('/components.html');
    await expect(page.getByRole('heading', { name: 'Useful pieces, ready to adapt.' })).toBeVisible();
    // Verify it has at least some component examples
    await expect(page.locator('.cambric-page')).toBeVisible();
});

test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');
    expect(criticalViolations).toEqual([]);
});
