const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('home renders the product identity from config', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');

    await expect(page.locator('#product-name')).toHaveText('Cambric Website');
    await expect(page.locator('.site-nav, nav.nav')).toBeVisible();
    // Version is intentionally not shown in the UI.
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', './assets/cambric-logo.png');

    expect(errors).toEqual([]);
});

test('theme choice flips and survives a reload', async ({ page }) => {
    await page.goto('/');

    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('[data-theme-toggle]').click();
    const after = await page.locator('html').getAttribute('data-theme');

    expect(after).not.toBe(before);
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', String(after === 'dark'));

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', after);
});

test('language switch sets Arabic and right-to-left, and switches back', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('[data-language-toggle]');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(toggle).toHaveText('English');
    await expect(page.locator('[data-i18n="nav.contact"]')).toHaveText('تواصل');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('the demo form validates locally and says nothing was sent', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-contact-form] button[type="submit"]').click();

    await expect(page.locator('[data-form-status]')).toHaveText('Please check the highlighted fields.');
    await expect(page.locator('[data-error-for="email"]')).toHaveText('Enter a valid email address.');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');

    await page.fill('#contact-name', 'Ada Lovelace');
    await page.fill('#contact-email', 'ada@example.com');
    await page.fill('#contact-message', 'A message long enough to pass validation.');
    await page.locator('[data-contact-form] button[type="submit"]').click();

    await expect(page.locator('[data-form-status]')).toHaveText('Validation passed. Nothing was sent.');
});

test('components page renders the gallery', async ({ page }) => {
    await page.goto('/components.html');

    await expect(page.getByRole('heading', { name: 'Useful pieces, already consistent.' })).toBeVisible();
    await expect(page.locator('.status[data-state="online"]')).toBeVisible();
    await expect(page.locator('.empty-state')).toBeVisible();
});

test('404 page explains the error and does not redirect', async ({ page }) => {
    await page.goto('/missing-page');

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/missing-page$/);
});

test('home has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
});

test('dark theme has no critical accessibility violations', async ({ page }) => {
    await page.addInitScript(() => {
        window.localStorage.setItem('cambric:theme', 'dark');
    });
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
});
