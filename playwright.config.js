const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/browser',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'on-first-retry'
    },
    webServer: {
        command: 'npm run dev',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 120000
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } }
    ]
});
