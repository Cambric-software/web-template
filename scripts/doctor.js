const fs = require('fs');
const path = require('path');

function validateProject(root = process.cwd()) {
    const requiredFiles = [
        'config/cambric.config.json',
        'cambric.manifest.json',
        'index/index.html',
        'index/css/main.css',
        'index/js/app.js',
        'services/storage.js',
        'services/cache.js',
        'services/release.js',
        'services/i18n.js',
        'services/version.js',
        'security/security.js'
    ];

    const problems = [];

    for (const relativePath of requiredFiles) {
        const fullPath = path.join(root, relativePath);
        if (!fs.existsSync(fullPath)) {
            problems.push(`Missing required file: ${relativePath}`);
        }
    }

    const configPath = path.join(root, 'config', 'cambric.config.json');
    const manifestPath = path.join(root, 'cambric.manifest.json');

    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.product || !config.product.id) {
            problems.push('config/cambric.config.json is missing product.id');
        }
        if (!config.product || !config.product.version) {
            problems.push('config/cambric.config.json is missing product.version');
        }
    } catch (error) {
        problems.push(`config/cambric.config.json is invalid JSON: ${error.message}`);
    }

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!manifest.productId) {
            problems.push('cambric.manifest.json is missing productId');
        }
        if (!manifest.version) {
            problems.push('cambric.manifest.json is missing version');
        }
    } catch (error) {
        problems.push(`cambric.manifest.json is invalid JSON: ${error.message}`);
    }

    return {
        ok: problems.length === 0,
        problems
    };
}

function runDoctor(root = process.cwd()) {
    const result = validateProject(root);

    if (!result.ok) {
        console.error('Cambric doctor found issues:');
        for (const problem of result.problems) {
            console.error(`- ${problem}`);
        }
        process.exitCode = 1;
        return result;
    }

    console.log('Cambric doctor passed.');
    return result;
}

if (require.main === module) {
    runDoctor();
}

module.exports = { validateProject, runDoctor };
