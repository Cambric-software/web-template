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

assert.ok(config.product && config.product.id, 'config product id is required');
assert.ok(manifest.productId === config.product.id, 'manifest productId should match config');
assert.ok(CAMBRIC_VERSION, 'version should be defined');
assert.ok(getVersionInfo().semver === CAMBRIC_VERSION, 'central version should be consistent');

const storage = new CambricStorage({ namespace: 'cambric:test' });
storage.set('settings', { theme: 'dark' });
assert.deepStrictEqual(storage.get('settings'), { theme: 'dark' });

const flags = getFeatureFlags();
assert.ok(typeof flags === 'object');
assert.strictEqual(isFeatureEnabled('offline'), true);

CambricI18n.setLanguage('ar');
assert.strictEqual(CambricI18n.get('offline'), 'غير متصل');

const buildInfo = getVersionInfo();
assert.ok(buildInfo && buildInfo.timeStamp, 'build info should include timestamp');

console.log('Cambric core tests passed.');
