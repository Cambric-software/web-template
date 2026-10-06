const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const configPath = path.join(root, 'config', 'cambric.config.json');
const manifestPath = path.join(root, 'cambric.manifest.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const { CAMBRIC_VERSION, getVersionInfo } = require('../services/version.js');
const { CambricStorage } = require('../services/storage.js');
const { getFeatureFlags, setFeatureFlag, isFeatureEnabled } = require('../services/feature-flags.js');
const { CambricI18n } = require('../services/i18n.js');

// ── Config / manifest ─────────────────────────────────────────────────────────
assert.ok(config.product && config.product.id, 'config product id is required');
assert.ok(manifest.productId === config.product.id, 'manifest productId should match config');

// ── Version ───────────────────────────────────────────────────────────────────
assert.ok(CAMBRIC_VERSION, 'version should be defined');
assert.ok(getVersionInfo().semver === CAMBRIC_VERSION, 'central version should be consistent');
const buildInfo = getVersionInfo();
assert.ok(buildInfo && buildInfo.timeStamp, 'build info should include timestamp');

// ── Storage: basic get/set ────────────────────────────────────────────────────
const storage = new CambricStorage({ namespace: 'cambric:test' });
storage.set('settings', { theme: 'dark' });
assert.deepStrictEqual(storage.get('settings'), { theme: 'dark' });

// ── Storage: clearNamespace ───────────────────────────────────────────────────
const ns = new CambricStorage({ namespace: 'cambric:ns-test' });
ns.set('a', 1);
ns.set('b', 2);
const cleared = ns.clearNamespace();
assert.strictEqual(cleared, 2, 'clearNamespace should return count of removed keys');
assert.strictEqual(ns.get('a', null), null, 'key a should be gone after clearNamespace');
assert.strictEqual(ns.get('b', null), null, 'key b should be gone after clearNamespace');

// ── Storage: dark mode persistence ───────────────────────────────────────────
const themeStorage = new CambricStorage({ namespace: 'cambric:theme-test' });
themeStorage.set('theme', 'dark');
assert.strictEqual(themeStorage.get('theme'), 'dark', 'dark mode preference should persist');
themeStorage.set('theme', 'light');
assert.strictEqual(themeStorage.get('theme'), 'light', 'switching to light should persist');
themeStorage.clearNamespace();

// ── Storage: clearNamespace only clears own namespace ────────────────────────
const nsA = new CambricStorage({ namespace: 'cambric:ns-a' });
const nsB = new CambricStorage({ namespace: 'cambric:ns-b' });
nsA.set('x', 'hello');
nsB.set('y', 'world');
nsA.clearNamespace();
assert.strictEqual(nsA.get('x', null), null, 'nsA key should be cleared');
assert.strictEqual(nsB.get('y', null), 'world', 'nsB key should be untouched by nsA clear');
nsB.clearNamespace();

// ── Feature flags ─────────────────────────────────────────────────────────────
const flags = getFeatureFlags();
assert.ok(typeof flags === 'object');
assert.strictEqual(isFeatureEnabled('offline'), true);

// ── i18n / localization ───────────────────────────────────────────────────────
CambricI18n.setLanguage('ar');
assert.strictEqual(CambricI18n.get('offline'), 'غير متصل');
CambricI18n.setLanguage('en');
assert.strictEqual(CambricI18n.get('offline'), 'Offline');

// ── CSP config consistency ────────────────────────────────────────────────────
assert.strictEqual(
    config.security.cspEnabled,
    true,
    'cspEnabled should be true since the meta CSP tag is active in index.html',
);

// ── Version display ───────────────────────────────────────────────────────────
// Verify the version string is a valid semver
assert.ok(
    /^\d+\.\d+\.\d+/.test(CAMBRIC_VERSION),
    `CAMBRIC_VERSION "${CAMBRIC_VERSION}" should be semver x.y.z`,
);

// ── HTML structure ────────────────────────────────────────────────────────────
const indexHtml = fs.readFileSync(path.join(root, 'index', 'index.html'), 'utf8');
assert.ok(indexHtml.includes('data-cambric-version'), 'index.html should have data-cambric-version element');
assert.ok(indexHtml.includes('data-theme-toggle'), 'index.html should have theme toggle button');
assert.ok(indexHtml.includes('data-language-toggle'), 'index.html should have language toggle button');

const componentsHtml = fs.readFileSync(path.join(root, 'index', 'components.html'), 'utf8');
assert.ok(componentsHtml.length > 100, 'components.html should not be empty');

// ── 404 page ─────────────────────────────────────────────────────────────────
const has404 = fs.existsSync(path.join(root, '404.html'));
assert.ok(has404, '404.html should exist for GitHub Pages fallback');

console.log('Cambric core tests passed.');
