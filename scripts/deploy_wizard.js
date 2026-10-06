#!/usr/bin/env node
// Cambric Web Template — Deploy Wizard
// Run: node scripts/deploy_wizard.js
//
// Guides through deployment to GitHub Pages, Netlify, Vercel, or self-hosted.

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const C = {
    reset: '\u001b[0m', cyan: '\u001b[36m', green: '\u001b[32m',
    yellow: '\u001b[33m', red: '\u001b[31m', dim: '\u001b[2m',
};
const col = (s, c) => process.stdout.isTTY ? `${C[c]}${s}${C.reset}` : s;

async function ask(rl, q, fallback = '') {
    return new Promise(resolve => {
        const hint = fallback ? ` ${col(`[${fallback}]`, 'dim')}` : '';
        rl.question(`${col(q, 'yellow')}${hint}: `, a => resolve(a.trim() || fallback));
    });
}

async function askChoice(rl, q, opts, def = 0) {
    console.log(col(q, 'yellow'));
    opts.forEach((o, i) => console.log(`  ${i === def ? '>' : ' '} ${i+1}. ${o}`));
    const a = await ask(rl, 'Choice', String(def + 1));
    const n = parseInt(a, 10);
    return (n >= 1 && n <= opts.length) ? opts[n-1] : opts[def];
}

async function askYesNo(rl, q, def = true) {
    const a = await ask(rl, `${q} ${def ? '[Y/n]' : '[y/N]'}`, def ? 'y' : 'n');
    return a.toLowerCase() === 'y';
}

function run(cmd) {
    const r = spawnSync(cmd, { shell: true, encoding: 'utf8' });
    return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

async function main() {
    const root = process.cwd();

    // Read config
    let siteName = 'Cambric Site';
    let siteUrl  = 'https://example.com';
    try {
        const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config', 'cambric.config.json'), 'utf8'));
        siteName = cfg.product?.name || siteName;
        siteUrl  = cfg.site?.url || siteUrl;
    } catch (_) {}

    console.log(`\n${col('╔══════════════════════════════════════════╗', 'cyan')}`);
    console.log(col('║   Cambric Web — Deploy Wizard            ║', 'cyan'));
    console.log(col('╚══════════════════════════════════════════╝', 'cyan'));
    console.log(`\nSite: ${col(siteName, 'cyan')}  URL: ${col(siteUrl, 'dim')}\n`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // Step 1: Build
    if (await askYesNo(rl, 'Run build before deploying?', true)) {
        console.log(col('\nBuilding...', 'cyan'));
        const r = run('node scripts/build.js');
        if (!r.ok) {
            console.log(col('Build failed. Fix errors before deploying.', 'red'));
            console.log(r.out);
            rl.close(); process.exit(1);
        }
        console.log(col('  ✓ Build succeeded', 'green'));
    }

    // Step 2: Choose target
    console.log('');
    const target = await askChoice(rl, 'Where are you deploying?', [
        'GitHub Pages (push to main — automatic via CI)',
        'GitHub Pages with custom domain',
        'Netlify',
        'Vercel',
        'Self-hosted static server',
        'Show dist/ path only',
    ], 0);

    console.log('');
    const distPath = path.join(root, 'dist');

    if (target === 'GitHub Pages (push to main — automatic via CI)') {
        console.log(col('═══ GitHub Pages — Auto Deploy ═════════════', 'cyan'));
        if (run('git status').ok) {
            if (await askYesNo(rl, 'Commit and push to main now?', true)) {
                const msg = await ask(rl, 'Commit message', `Deploy: ${siteName}`);
                run('git add -A');
                run(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
                const push = run('git push origin main');
                if (push.ok) {
                    console.log(col('  ✓ Pushed. GitHub Actions will deploy automatically.', 'green'));
                    console.log('  Watch: https://github.com/Cambric-software/web-template/actions');
                } else {
                    console.log(col('  Push failed — check your remote.', 'red'));
                }
            }
        } else {
            console.log(col('  Not a git repo. Initialize one first.', 'yellow'));
        }

    } else if (target === 'GitHub Pages with custom domain') {
        console.log(col('═══ Custom Domain on GitHub Pages ═══════════', 'cyan'));
        const domain = await ask(rl, 'Your custom domain (e.g. mysite.com)', '');
        if (domain && fs.existsSync(distPath)) {
            fs.writeFileSync(path.join(distPath, 'CNAME'), domain + '\n', 'utf8');
            console.log(col(`  ✓ dist/CNAME written: ${domain}`, 'green'));
        }
        console.log('\nDNS setup:');
        console.log(`  CNAME: ${domain || 'yourdomain.com'} → YOUR_USERNAME.github.io`);
        console.log('  GitHub Settings → Pages → Custom domain → enter your domain');
        console.log('  Enable "Enforce HTTPS" after DNS propagates (up to 24h)');

    } else if (target === 'Netlify') {
        console.log(col('═══ Netlify ══════════════════════════════════', 'cyan'));
        console.log(`\ndist/ folder: ${distPath}`);
        console.log('\nOption A — Drag and drop:');
        console.log('  Go to https://app.netlify.com → drag the dist/ folder');
        console.log('\nOption B — Continuous deployment:');
        console.log('  Connect your GitHub repo in Netlify');
        console.log('  Build command: node scripts/build.js');
        console.log('  Publish directory: dist');

    } else if (target === 'Vercel') {
        console.log(col('═══ Vercel ═══════════════════════════════════', 'cyan'));
        if (run('vercel --version').ok) {
            if (await askYesNo(rl, 'Deploy now with vercel CLI?', true)) {
                console.log(run('vercel dist/ --prod').out);
            }
        } else {
            console.log('  Install Vercel CLI:  npm install -g vercel');
            console.log('  Then deploy:         vercel dist/ --prod');
            console.log('  Or connect at:       https://vercel.com');
        }

    } else if (target === 'Self-hosted static server') {
        console.log(col('═══ Self-Hosted ══════════════════════════════', 'cyan'));
        console.log(`\ndist/ folder: ${distPath}`);
        console.log('\nCopy the dist/ folder to your server:');
        console.log('  rsync:   rsync -avz dist/ user@server:/var/www/html/');
        console.log('  scp:     scp -r dist/* user@server:/var/www/html/');
        console.log('\nAny static file server works: Nginx, Apache, Caddy, S3 + CloudFront.');

    } else {
        console.log(`dist/ folder: ${distPath}`);
    }

    rl.close();
    console.log(`\n${col('Deploy wizard complete.', 'green')}\n`);
}

main().catch(err => {
    console.error(col(`Deploy wizard failed: ${err.message}`, 'red'));
    process.exit(1);
});
