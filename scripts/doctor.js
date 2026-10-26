const fs = require('fs');
const path = require('path');

const REQUIRED = [
    'index/index.html',
    'index/components.html',
    'index/404.html',
    'index/config.json',
    'index/css/main.css',
    'index/js/theme.js',
    'index/js/site.js',
    'index/service-worker.js',
    'index/manifest.webmanifest',
    'index/assets/cambric-logo.png',
    'cambric.manifest.json',
    'package.json'
];

const PAGES = ['index/index.html', 'index/components.html', 'index/404.html'];

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function isExternal(target) {
    return /^(?:[a-z]+:)?\/\//i.test(target)
        || /^(?:mailto|tel|data|javascript):/i.test(target)
        || target.startsWith('#');
}

/**
 * Returns every local href/src in [htmlFile] whose target does not exist on
 * disk. This is the check that catches a page linked to a path the build does
 * not produce.
 */
function findBrokenLocalLinks(root, htmlFile = null) {
    const problems = [];
    const pages = htmlFile ? [htmlFile] : PAGES;

    for (const page of pages) {
        const pagePath = path.join(root, page);
        if (!fs.existsSync(pagePath)) {
            problems.push(`Missing page: ${page}`);
            continue;
        }

        const html = fs.readFileSync(pagePath, 'utf8');
        const attributes = /(?:href|src)="([^"]+)"/g;
        let match;

        while ((match = attributes.exec(html)) !== null) {
            const raw = match[1].trim();
            if (!raw || isExternal(raw)) {
                continue;
            }

            const clean = raw.split('#')[0].split('?')[0];
            if (!clean) {
                continue;
            }

            let target = clean.startsWith('/')
                ? path.join(root, 'index', clean)
                : path.resolve(path.dirname(pagePath), clean);

            if (clean.endsWith('/')) {
                target = path.join(target, 'index.html');
            }

            const inside = path.resolve(target).startsWith(path.resolve(path.join(root, 'index')));
            if (!inside) {
                problems.push(`${page}: link escapes the site: ${raw}`);
                continue;
            }

            if (!fs.existsSync(target)) {
                problems.push(`${page}: broken local link: ${raw}`);
            }
        }
    }

    return problems;
}

function validateProject(root = process.cwd()) {
    const problems = [];

    for (const relative of REQUIRED) {
        if (!fs.existsSync(path.join(root, relative))) {
            problems.push(`Missing required file: ${relative}`);
        }
    }

    if (problems.length > 0) {
        return { ok: false, problems };
    }

    let config;
    let manifest;
    let pkg;

    try {
        config = readJson(path.join(root, 'index', 'config.json'));
    } catch (error) {
        return { ok: false, problems: [`index/config.json is invalid JSON: ${error.message}`] };
    }

    try {
        manifest = readJson(path.join(root, 'cambric.manifest.json'));
    } catch (error) {
        return { ok: false, problems: [`cambric.manifest.json is invalid JSON: ${error.message}`] };
    }

    try {
        pkg = readJson(path.join(root, 'package.json'));
    } catch (error) {
        return { ok: false, problems: [`package.json is invalid JSON: ${error.message}`] };
    }

    const product = config.product || {};
    if (!product.id) {
        problems.push('index/config.json is missing product.id');
    }
    if (!product.name) {
        problems.push('index/config.json is missing product.name');
    }
    if (!/^\d+\.\d+\.\d+/.test(product.version || '')) {
        problems.push('index/config.json product.version must be x.y.z');
    }

    if (manifest.productId !== product.id) {
        problems.push('cambric.manifest.json productId does not match index/config.json');
    }
    if (manifest.version !== product.version) {
        problems.push('cambric.manifest.json version does not match index/config.json');
    }
    if (pkg.version !== product.version) {
        problems.push('package.json version does not match index/config.json');
    }

    problems.push(...findBrokenLocalLinks(root));

    return { ok: problems.length === 0, problems };
}

function runDoctor(root = process.cwd()) {
    const nodeMajor = Number(process.versions.node.split('.')[0]);
    if (Number.isNaN(nodeMajor) || nodeMajor < 18) {
        console.error(`Node.js ${process.versions.node} detected. Version 18 or higher is required.`);
        process.exitCode = 1;
        return { ok: false, problems: ['Node.js >= 18 required'] };
    }

    const result = validateProject(root);
    if (!result.ok) {
        console.error('Cambric doctor found issues:');
        for (const problem of result.problems) {
            console.error(`- ${problem}`);
        }
        process.exitCode = 1;
        return result;
    }

    console.log(`Cambric doctor passed. (Node.js ${process.versions.node})`);
    return result;
}

if (require.main === module) {
    runDoctor();
}

module.exports = { validateProject, runDoctor, findBrokenLocalLinks, REQUIRED, PAGES };
