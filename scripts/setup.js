#!/usr/bin/env node
// Cambric Web Template — Setup Wizard
// Run: node scripts/setup.js
// or:  node bin/cambric.js setup
//
// Asks the right questions for any website type —
// product page, portfolio, blog, docs, landing page, e-commerce, community, etc.

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── Utilities ──────────────────────────────────────────────────────────────────

const C = {
    reset: '\u001b[0m', cyan: '\u001b[36m', green: '\u001b[32m',
    yellow: '\u001b[33m', red: '\u001b[31m', dim: '\u001b[2m', bold: '\u001b[1m',
};
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const col = (s, c) => useColor ? `${C[c]}${s}${C.reset}` : s;

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [from, to] of Object.entries(replacements)) {
        content = content.split(from).join(to);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

function toSafeId(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cambric-site';
}

function isValidUrl(s) {
    return !s || /^https?:\/\/[^\s]+$/.test(s);
}

// ── Interactive prompt helpers ─────────────────────────────────────────────────

async function ask(rl, question, fallback = '') {
    return new Promise(resolve => {
        const hint = fallback ? ` ${col(`[${fallback}]`, 'dim')}` : '';
        rl.question(`${col(question, 'yellow')}${hint}: `, answer => {
            resolve(answer.trim() || fallback);
        });
    });
}

async function askChoice(rl, question, options, defaultIndex = 0) {
    console.log(col(question, 'yellow'));
    options.forEach((opt, i) => {
        const marker = i === defaultIndex ? '>' : ' ';
        console.log(`  ${marker} ${i + 1}. ${opt}`);
    });
    const answer = await ask(rl, `Choice`, String(defaultIndex + 1));
    const n = parseInt(answer, 10);
    if (n >= 1 && n <= options.length) return options[n - 1];
    return options[defaultIndex];
}

async function askMultiChoice(rl, question, options, defaultIndices = []) {
    console.log(col(`${question} (comma-separated numbers, e.g. 1,2,3)`, 'yellow'));
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    const defaultStr = defaultIndices.map(i => i + 1).join(',');
    const answer = await ask(rl, 'Choices', defaultStr);
    const parts = answer.split(',').map(p => parseInt(p.trim(), 10) - 1).filter(i => i >= 0 && i < options.length);
    return parts.length > 0 ? parts.map(i => options[i]) : defaultIndices.map(i => options[i]);
}

async function askYesNo(rl, question, defaultYes = true) {
    const hint = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await ask(rl, `${question} ${hint}`, defaultYes ? 'y' : 'n');
    return answer.toLowerCase() === 'y';
}

// ── Non-interactive (piped) mode ───────────────────────────────────────────────

function parseNonInteractive(args) {
    return {
        siteName: args[0] || 'My Website',
        description: args[1] || 'A Cambric website',
        siteUrl: args[2] || 'https://example.com',
        siteType: 'Product / Landing page',
        pages: ['Home', 'About', 'Contact'],
        colorScheme: 'Default (Cambric)',
        darkModeDefault: 'Follow system',
        language: 'English only',
        hasContactForm: true,
        pwaEnabled: false,
        deployTarget: 'GitHub Pages',
        newFolderName: args[3] || '',
        confirmed: true,
    };
}

// ── Main wizard ────────────────────────────────────────────────────────────────

async function runWizard() {
    const root = process.cwd();

    // Safety check — warn if already configured
    const configPath = path.join(root, 'config', 'cambric.config.json');
    if (fs.existsSync(configPath)) {
        try {
            const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const existing = cfg.product && cfg.product.name;
            if (existing && existing !== 'Cambric Website' && existing !== 'Cambric Web Template') {
                console.log(`\n${col(`This project is already configured as "${existing}".`, 'yellow')}`);
                if (!process.stdout.isTTY) {
                    console.log('Running in non-interactive mode — proceeding.');
                } else {
                    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
                    const overwrite = await askYesNo(rl2, 'Overwrite existing configuration?', false);
                    rl2.close();
                    if (!overwrite) {
                        console.log(col('Setup cancelled. Existing configuration preserved.', 'yellow'));
                        process.exit(0);
                    }
                }
            }
        } catch (_) {}
    }

    // Non-interactive mode (args passed or stdin piped)
    const args = process.argv.slice(2);
    if (!process.stdin.isTTY && args.length === 0) {
        const buf = await new Promise(resolve => {
            let d = '';
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', c => d += c);
            process.stdin.on('end', () => resolve(d));
        });
        const lines = buf.split(/\r?\n/).map(l => l.trim());
        return applySetup(root, parseNonInteractive(lines));
    }
    if (args.length > 0) {
        return applySetup(root, parseNonInteractive(args));
    }

    // Interactive mode
    console.log(`\n${col('╔══════════════════════════════════════════╗', 'cyan')}`);
    console.log(col('║   Cambric Web Template — Setup Wizard    ║', 'cyan'));
    console.log(col('╚══════════════════════════════════════════╝', 'cyan'));
    console.log(col('Initialize this template for any type of website.\n', 'dim'));

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // ── Section 1: Identity ──────────────────────────────────────────────────
    console.log(col('\n═══ Site Identity ═══════════════════════════', 'cyan'));

    const siteName    = await ask(rl, 'Website / product name', 'My Website');
    const description = await ask(rl, 'Short description', 'A Cambric website');
    let   siteUrl     = await ask(rl, 'Website URL (e.g. https://example.com)', 'https://example.com');
    while (!isValidUrl(siteUrl)) {
        console.log(col('  URL must start with http:// or https://', 'red'));
        siteUrl = await ask(rl, 'Website URL', 'https://example.com');
    }

    // ── Section 2: Site Type ─────────────────────────────────────────────────
    console.log(col('\n═══ Site Type ══════════════════════════════', 'cyan'));

    const siteType = await askChoice(rl, 'What kind of website are you building?', [
        'Product / Landing page',
        'Portfolio / Personal',
        'Blog / News / Magazine',
        'Documentation / Knowledge base',
        'E-commerce / Shop',
        'Community / Forum',
        'SaaS / App marketing site',
        'Non-profit / Organisation',
        'Event / Conference',
        'Custom / Other',
    ], 0);

    // ── Section 3: Pages ─────────────────────────────────────────────────────
    console.log(col('\n═══ Pages ══════════════════════════════════', 'cyan'));

    const pages = await askMultiChoice(rl, 'Which pages does your site need?', [
        'Home',
        'About',
        'Services / Features',
        'Pricing',
        'Blog / Articles',
        'Documentation',
        'Portfolio / Work',
        'Team',
        'Contact',
        'Privacy Policy',
        'Terms of Service',
    ], [0, 1, 8]);

    // ── Section 4: Visual Design ─────────────────────────────────────────────
    console.log(col('\n═══ Visual Design ══════════════════════════', 'cyan'));

    const colorScheme = await askChoice(rl, 'Color scheme', [
        'Default (Cambric dark blue / white)',
        'Minimal (grey / white / black)',
        'Warm (earth tones)',
        'Vibrant (bold accent color)',
        'Custom (I will configure manually)',
    ], 0);

    const darkModeDefault = await askChoice(rl, 'Default theme', [
        'Light',
        'Dark',
        'Follow system',
    ], 2);

    // ── Section 5: Language ──────────────────────────────────────────────────
    console.log(col('\n═══ Language ═══════════════════════════════', 'cyan'));

    const language = await askChoice(rl, 'Supported languages', [
        'English only',
        'Arabic only (RTL)',
        'English + Arabic (RTL)',
        'English + other (configure later)',
    ], 0);

    // ── Section 6: Features ──────────────────────────────────────────────────
    console.log(col('\n═══ Features ═══════════════════════════════', 'cyan'));

    const hasContactForm = await askYesNo(rl, 'Include a contact form?', true);
    const pwaEnabled     = await askYesNo(rl, 'Enable PWA (offline support + installable)?', false);

    // ── Section 7: Deployment ────────────────────────────────────────────────
    console.log(col('\n═══ Deployment Target ══════════════════════', 'cyan'));

    const deployTarget = await askChoice(rl, 'Where will this site be deployed?', [
        'GitHub Pages',
        'Custom domain on GitHub Pages',
        'Netlify',
        'Vercel',
        'Self-hosted (any static server)',
        'Not decided yet',
    ], 0);

    // ── Section 8: Folder ────────────────────────────────────────────────────
    const newFolderName = await ask(rl, 'Rename project folder (optional, press Enter to skip)', '');

    rl.close();

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log(col('\n═══ Summary ════════════════════════════════', 'cyan'));
    console.log(`  Name:         ${siteName}`);
    console.log(`  ID:           ${toSafeId(siteName)}`);
    console.log(`  URL:          ${siteUrl}`);
    console.log(`  Type:         ${siteType}`);
    console.log(`  Pages:        ${pages.join(', ')}`);
    console.log(`  Color scheme: ${colorScheme}`);
    console.log(`  Theme:        ${darkModeDefault}`);
    console.log(`  Language:     ${language}`);
    console.log(`  Contact form: ${hasContactForm ? 'yes' : 'no'}`);
    console.log(`  PWA:          ${pwaEnabled ? 'yes' : 'no'}`);
    console.log(`  Deploy:       ${deployTarget}`);
    if (newFolderName) console.log(`  Folder:       ${newFolderName}`);
    console.log('');

    // Confirm
    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirmed = await askYesNo(rl2, 'Apply these settings?', true);
    rl2.close();

    if (!confirmed) {
        console.log(col('Setup cancelled. No files were changed.', 'yellow'));
        process.exit(0);
    }

    return applySetup(root, {
        siteName, description, siteUrl, siteType, pages,
        colorScheme, darkModeDefault, language,
        hasContactForm, pwaEnabled, deployTarget, newFolderName,
        confirmed: true,
    });
}

// ── Apply settings to project files ──────────────────────────────────────────

function applySetup(root, opts) {
    const {
        siteName, description, siteUrl, siteType, pages,
        colorScheme, darkModeDefault, language,
        hasContactForm, pwaEnabled, deployTarget, newFolderName,
    } = opts;

    const productId = toSafeId(siteName);
    const cleanUrl = (siteUrl || 'https://example.com').replace(/\/$/, '');

    // Derive locale settings
    const localeMap = {
        'English only':              { default: 'en', supported: ['en'], rtl: [] },
        'Arabic only (RTL)':         { default: 'ar', supported: ['ar'], rtl: ['ar'] },
        'English + Arabic (RTL)':    { default: 'en', supported: ['en','ar'], rtl: ['ar'] },
        'English + other (configure later)': { default: 'en', supported: ['en'], rtl: [] },
    };
    const localeConfig = localeMap[language] || localeMap['English only'];

    // ── config/cambric.config.json ──────────────────────────────────────────
    const configPath = path.join(root, 'config', 'cambric.config.json');
    if (fs.existsSync(configPath)) {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        cfg.product = cfg.product || {};
        cfg.product.name = siteName;
        cfg.product.id = productId;
        cfg.product.description = description;
        cfg.product.websiteTitle = siteName;
        cfg.site = cfg.site || {};
        cfg.site.url = cleanUrl;
        cfg.site.language = localeConfig.default;
        cfg.localization = {
            defaultLanguage: localeConfig.default,
            supportedLanguages: localeConfig.supported,
            rtlLanguages: localeConfig.rtl,
        };
        cfg.features = cfg.features || {};
        cfg.features.pwa = pwaEnabled;
        cfg.features.offline = pwaEnabled;
        // Store wizard choices for reference
        cfg.siteMeta = {
            siteType, pages, colorScheme, darkModeDefault,
            hasContactForm, deployTarget,
        };
        writeJson(configPath, cfg);
        console.log(col('  ✓ config/cambric.config.json updated', 'green'));
    }

    // ── cambric.manifest.json ───────────────────────────────────────────────
    const manifestPath = path.join(root, 'cambric.manifest.json');
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.name = siteName;
        manifest.description = description;
        manifest.productId = productId;
        manifest.version = manifest.version || '1.0.0';
        writeJson(manifestPath, manifest);
        console.log(col('  ✓ cambric.manifest.json updated', 'green'));
    }

    // ── index/index.html — title and meta description ───────────────────────
    const indexPath = path.join(root, 'index', 'index.html');
    if (fs.existsSync(indexPath)) {
        replaceInFile(indexPath, {
            '<title>Cambric Website</title>': `<title>${siteName}</title>`,
            'content="A local-first, privacy-aware website foundation by Cambric."':
                `content="${description}"`,
            '>Cambric Website<': `>${siteName}<`,
            '>Cambric<': `>${siteName.split(' ')[0]}<`,
        });
        // Set lang/dir attributes for RTL
        if (localeConfig.default === 'ar') {
            replaceInFile(indexPath, {
                '<html lang="en" dir="ltr">': '<html lang="ar" dir="rtl">',
            });
        }
        console.log(col('  ✓ index/index.html updated', 'green'));
    }

    // ── index/manifest.webmanifest ──────────────────────────────────────────
    const webManifestPath = path.join(root, 'index', 'manifest.webmanifest');
    if (fs.existsSync(webManifestPath)) {
        try {
            const wm = JSON.parse(fs.readFileSync(webManifestPath, 'utf8'));
            wm.name = siteName;
            wm.short_name = siteName.split(' ')[0];
            wm.description = description;
            wm.start_url = cleanUrl;
            writeJson(webManifestPath, wm);
            console.log(col('  ✓ index/manifest.webmanifest updated', 'green'));
        } catch (_) {}
    }

    // ── package.json name ────────────────────────────────────────────────────
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.name = productId;
        pkg.description = description;
        writeJson(pkgPath, pkg);
        console.log(col('  ✓ package.json updated', 'green'));
    }

    // ── sitemap.xml ──────────────────────────────────────────────────────────
    const sitemapPath = path.join(root, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
        replaceInFile(sitemapPath, { 'https://example.com': cleanUrl });
        console.log(col('  ✓ sitemap.xml updated', 'green'));
    }

    // ── README.md ────────────────────────────────────────────────────────────
    const readmePath = path.join(root, 'README.md');
    if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        if (readmeContent.includes('Cambric Web Template')) {
            fs.writeFileSync(readmePath,
                `# ${siteName}\n\n${description}\n\n` +
                `**Site type:** ${siteType}  \n` +
                `**URL:** ${cleanUrl}  \n` +
                `**Deploy:** ${deployTarget}\n\n` +
                `## Getting started\n\n` +
                `\`\`\`bash\nnpm install\nnpm run doctor\nnpm run build\nnpm run dev\n\`\`\`\n\n` +
                `## Deploy\n\n` +
                `\`\`\`bash\nnode scripts/deploy_wizard.js\n\`\`\`\n\n` +
                `See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.\n`
            , 'utf8');
            console.log(col('  ✓ README.md updated', 'green'));
        }
    }

    // ── Remove template-only artifacts ──────────────────────────────────────
    for (const item of ['SETUP.md']) {
        const p = path.join(root, item);
        if (fs.existsSync(p)) {
            fs.rmSync(p, { recursive: true, force: true });
            console.log(col(`  ✓ Removed template artifact: ${item}`, 'green'));
        }
    }

    // ── Rename folder if requested ───────────────────────────────────────────
    let finalRoot = root;
    if (newFolderName && newFolderName.trim()) {
        const safeName = newFolderName.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
        const parent = path.dirname(root);
        const target = path.join(parent, safeName);
        if (target !== root && !fs.existsSync(target)) {
            fs.renameSync(root, target);
            finalRoot = target;
            console.log(col(`  ✓ Project folder renamed to: ${safeName}`, 'green'));
        }
    }

    console.log('');
    console.log(col('Setup complete!', 'green'));
    console.log('');
    console.log('Next steps:');
    console.log('  npm install');
    console.log('  npm run doctor');
    console.log('  npm run dev        # preview locally');
    console.log('  npm run build      # build for deployment');
    console.log('  node scripts/deploy_wizard.js  # deploy');
    console.log('');

    return { siteName, productId, description, siteUrl: cleanUrl, root: finalRoot };
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (require.main === module) {
    runWizard().catch(err => {
        console.error(col(`Setup failed: ${err.message}`, 'red'));
        process.exit(1);
    });
}

module.exports = { setupProject: (opts) => applySetup(process.cwd(), { ...opts, confirmed: true }), toSafeId, runWizard };
