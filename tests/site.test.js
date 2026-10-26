const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateProject } = require('../scripts/doctor.js');

const root = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));

let checks = 0;

function check(condition, message) {
    checks += 1;
    assert.ok(condition, message);
}

// Structure and local links -------------------------------------------------

const doctor = validateProject(root);
check(doctor.ok, `doctor should pass:\n${doctor.problems.join('\n')}`);

const required = [
    'index/index.html',
    'index/components.html',
    'index/404.html',
    'index/config.json',
    'index/css/main.css',
    'index/js/theme.js',
    'index/js/site.js',
    'index/service-worker.js',
    'index/manifest.webmanifest',
    'cambric.manifest.json',
    'package.json'
];

for (const file of required) {
    check(fs.existsSync(path.join(root, file)), `${file} should exist`);
}

// Version and identity ------------------------------------------------------

const config = readJson('index/config.json');
const manifest = readJson('cambric.manifest.json');
const pkg = readJson('package.json');

check(config.product.id === manifest.productId, 'manifest productId should match config');
check(config.product.version === manifest.version, 'manifest version should match config');
check(config.product.version === pkg.version, 'package version should match config');
check(/^\d+\.\d+\.\d+$/.test(config.product.version), 'version should be x.y.z');
check(config.product.name.length > 0, 'product name should not be empty');

// Pages ---------------------------------------------------------------------

const indexHtml = read('index/index.html');
const componentsHtml = read('index/components.html');
const notFoundHtml = read('index/404.html');

for (const [name, html] of [
    ['index.html', indexHtml],
    ['components.html', componentsHtml],
    ['404.html', notFoundHtml]
]) {
    check((html.match(/<h1[\s>]/g) || []).length === 1, `${name} should have exactly one h1`);
    check(html.includes('name="viewport"'), `${name} should set a viewport`);
    check(html.includes("default-src 'self'"), `${name} should keep the CSP`);
    check(!html.includes('href="./index/'), `${name} should not use the old broken ./index/ prefix`);
    check(!html.includes('src="./services/'), `${name} should not load deleted services`);
}

check((indexHtml.match(/data-language-toggle/g) || []).length === 1, 'index should have one language toggle');
check((componentsHtml.match(/data-language-toggle/g) || []).length === 1, 'components should have one language toggle');
check((indexHtml.match(/data-theme-toggle/g) || []).length === 1, 'index should have one theme toggle');
check(indexHtml.includes('id="product-name"'), 'home should expose the product name');
check(indexHtml.includes('data-contact-form'), 'home should include the demo form');
// Version is intentionally not shown in the UI.
check(!/location\.(replace|href)\s*=/.test(notFoundHtml), '404 page should not redirect');

// Scripts -------------------------------------------------------------------

const siteJs = read('index/js/site.js');
const themeJs = read('index/js/theme.js');
const serviceWorker = read('index/service-worker.js');

check(siteJs.includes("fetch('./config.json'"), 'site.js should read the local config');
check(!/\d+\.\d+\.\d+/.test(siteJs), 'site.js should not hard-code a version');
check(!/\d+\.\d+\.\d+/.test(themeJs), 'theme.js should not hard-code a version');
check(themeJs.includes('cambric:theme'), 'theme.js should use the namespaced storage key');

const shellMatch = serviceWorker.match(/const SHELL = \[([\s\S]*?)\];/);
check(Boolean(shellMatch), 'service worker should declare a SHELL list');
const shellEntries = [...shellMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
check(shellEntries.length >= 8, 'service worker should cache the shell');

for (const entry of shellEntries) {
    if (entry === './') {
        check(fs.existsSync(path.join(root, 'index', 'index.html')), 'shell root should resolve to index.html');
        continue;
    }
    const target = entry.replace(/^\.\//, '');
    check(fs.existsSync(path.join(root, 'index', target)), `service worker caches a missing file: ${entry}`);
}

// Design tokens -------------------------------------------------------------

const css = read('index/css/main.css');
for (const token of [
    '--accent: oklch(0.85 0.17 150)',
    '--bg: oklch(0.16 0.02 250)',
    '--radius-card: 14px',
    '--radius-button: 11px',
    'prefers-reduced-motion'
]) {
    check(css.includes(token), `stylesheet should contain ${token}`);
}

// Form validation -----------------------------------------------------------

check(siteJs.includes('aria-invalid'), 'form validation should set aria-invalid');
check(siteJs.includes('data-form-status'), 'form validation should write a status');
check(siteJs.includes('Nothing was sent'), 'the form should say it does not send');

console.log(`Cambric site tests passed (${checks} checks).`);
