#!/usr/bin/env node
// Cambric Web Template — Component Generator
// Usage: node scripts/generate.js component MyCard
//        node scripts/generate.js changelog

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const C = {
    reset: '\u001b[0m', cyan: '\u001b[36m', green: '\u001b[32m',
    yellow: '\u001b[33m', red: '\u001b[31m', dim: '\u001b[2m',
};
const col = (s, c) => process.stdout.isTTY ? `${C[c]}${s}${C.reset}` : s;

const [,, command, name] = process.argv;

if (!command) {
    console.log(`\n${col('Cambric Generator', 'cyan')}\n`);
    console.log('  node scripts/generate.js component <Name>   Create HTML+CSS component');
    console.log('  node scripts/generate.js changelog          Generate CHANGELOG.md entry');
    console.log('  node scripts/generate.js images             Check images for issues');
    console.log('');
    process.exit(0);
}

// ── Component generator ────────────────────────────────────────────────────────

if (command === 'component') {
    if (!name) {
        console.error(col('Usage: node scripts/generate.js component <ComponentName>', 'red'));
        process.exit(1);
    }

    const pascal = name.charAt(0).toUpperCase() + name.slice(1);
    const kebab  = pascal.replace(/([A-Z])/g, (m, l, i) => (i > 0 ? '-' : '') + l.toLowerCase());

    // Add HTML snippet to index/components.html
    const componentsPath = path.join(process.cwd(), 'index', 'components.html');
    const snippet = `
<!-- ── ${pascal} ──────────────────────────────────────────────────── -->
<section class="cambric-section" id="${kebab}">
  <div class="section-heading">
    <p class="section-label">Component</p>
    <h2>${pascal}</h2>
    <p>Replace this description with what ${pascal} does.</p>
  </div>
  <div class="${kebab}">
    <!-- TODO: Add ${pascal} content here -->
    <p class="component-placeholder">${pascal} — replace with your implementation</p>
  </div>
</section>
`;

    if (fs.existsSync(componentsPath)) {
        let html = fs.readFileSync(componentsPath, 'utf8');
        // Insert before the closing </main> tag
        if (html.includes('</main>')) {
            html = html.replace('</main>', `${snippet}\n</main>`);
            fs.writeFileSync(componentsPath, html, 'utf8');
            console.log(col(`  ✓ HTML snippet added to index/components.html`, 'green'));
        } else {
            console.log(col('  Could not find </main> in components.html', 'yellow'));
        }
    }

    // Add CSS to index/css/main.css
    const cssPath = path.join(process.cwd(), 'index', 'css', 'main.css');
    const cssSnippet = `
/* ── ${pascal} ──────────────────────────────────────────────────────── */
.${kebab} {
  /* TODO: style the ${pascal} component */
  padding: var(--space-md, 1.5rem);
}

.${kebab} .component-placeholder {
  color: var(--color-text-muted, #6b7280);
  font-style: italic;
}
`;

    if (fs.existsSync(cssPath)) {
        fs.appendFileSync(cssPath, cssSnippet, 'utf8');
        console.log(col(`  ✓ CSS rules added to index/css/main.css`, 'green'));
    }

    console.log('');
    console.log(`Component: ${col(pascal, 'cyan')}`);
    console.log(`CSS class: ${col(`.${kebab}`, 'dim')}`);
    console.log(`Section ID: ${col(`#${kebab}`, 'dim')}`);
    console.log('');
}

// ── Changelog generator ────────────────────────────────────────────────────────

else if (command === 'changelog') {
    const root = process.cwd();

    // Read version from config
    let version = '1.0.0';
    try {
        const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config', 'cambric.config.json'), 'utf8'));
        version = cfg.product && cfg.product.version || version;
    } catch (_) {}

    // Last tag
    let lastTag = '';
    try { lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim(); } catch (_) {}

    // Commits
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    let commits = [];
    try {
        commits = execSync(`git log ${range} --oneline --no-merges`, { encoding: 'utf8' })
            .trim().split('\n').filter(Boolean)
            .map(l => l.replace(/^\S+\s+/, ''));
    } catch (_) {}

    if (commits.length === 0) {
        console.log('No new commits to changelog.');
        process.exit(0);
    }

    const features = commits.filter(c => c.startsWith('feat'));
    const fixes    = commits.filter(c => c.startsWith('fix'));
    const others   = commits.filter(c => !c.startsWith('feat') && !c.startsWith('fix'));
    const clean    = s => s.replace(/^(feat|fix|chore|docs|refactor|test|style)(\([^)]+\))?:\s*/, '');
    const date     = new Date().toISOString().slice(0, 10);

    let entry = `## [${version}] — ${date}\n\n`;
    if (features.length) { entry += `### Added\n${features.map(f => `- ${clean(f)}`).join('\n')}\n\n`; }
    if (fixes.length)    { entry += `### Fixed\n${fixes.map(f => `- ${clean(f)}`).join('\n')}\n\n`; }
    if (others.length)   { entry += `### Changed\n${others.map(f => `- ${clean(f)}`).join('\n')}\n\n`; }

    const changelogPath = path.join(root, 'CHANGELOG.md');
    const header = '# Changelog\n\nAll notable changes are documented here.\n\n';
    const existing = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : header;
    const rest = existing.startsWith('# Changelog') ? existing.slice(existing.indexOf('\n\n') + 2) : existing;
    fs.writeFileSync(changelogPath, header + entry + rest, 'utf8');

    // Record in .cambric/state.json
    const stateDir = path.join(root, '.cambric');
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir);
    const stateFile = path.join(stateDir, 'state.json');
    const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
    state.lastChangelog = { version, date, commitsIncluded: commits.length, timestamp: new Date().toISOString() };
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');

    console.log(col(`  ✓ CHANGELOG.md updated (${commits.length} commits, v${version})`, 'green'));
    console.log('');
}

// ── Image optimizer / checker ──────────────────────────────────────────────────

else if (command === 'images') {
    const root      = process.cwd();
    const assetsDir = path.join(root, 'index', 'assets');
    const indexHtml = path.join(root, 'index', 'index.html');
    const SIZE_WARN = 200 * 1024; // 200 KB

    let issues = 0;

    // Check image sizes
    if (fs.existsSync(assetsDir)) {
        const walk = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const fullPath = path.join(dir, e.name);
                if (e.isDirectory()) { walk(fullPath); continue; }
                if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(e.name)) {
                    const size = fs.statSync(fullPath).size;
                    const rel  = path.relative(root, fullPath);
                    if (size > SIZE_WARN) {
                        console.log(col(`  ⚠  ${rel}  (${Math.round(size/1024)}KB — over 200KB)`, 'yellow'));
                        issues++;
                    } else {
                        console.log(`  ✓  ${rel}  (${Math.round(size/1024)}KB)`);
                    }
                }
            }
        };
        walk(assetsDir);
    }

    // Check for missing alt text in index.html
    if (fs.existsSync(indexHtml)) {
        const html = fs.readFileSync(indexHtml, 'utf8');
        const imgTags = html.match(/<img[^>]*>/gi) || [];
        for (const tag of imgTags) {
            if (!tag.includes('alt=')) {
                console.log(col(`  ⚠  Missing alt text: ${tag.slice(0, 80)}`, 'yellow'));
                issues++;
            }
        }
    }

    if (issues === 0) {
        console.log(col('  ✓ No image issues found.', 'green'));
    } else {
        console.log(`\n  ${issues} issue(s) found.`);
    }
    console.log('');

} else {
    console.error(col(`Unknown command: ${command}`, 'red'));
    process.exit(1);
}
