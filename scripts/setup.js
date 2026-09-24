const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
    reset: '\u001b[0m',
    cyan: '\u001b[36m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    dim: '\u001b[2m',
    bold: '\u001b[1m'
};

function colorize(value, color, enabled = true) {
    return enabled ? `${colors[color]}${value}${colors.reset}` : value;
}

function renderWizardHeader(output, enabled) {
    output.write(`\n${colorize('CAMBRIC PROJECT SETUP', 'cyan', enabled)}\n`);
    output.write(`${colorize('Initialize this template for a new product.', 'dim', enabled)}\n\n`);
}

function renderWizardSummary(output, values, enabled) {
    output.write(`\n${colorize('Review project settings', 'bold', enabled)}\n`);
    output.write(`  ${colorize('Name', 'cyan', enabled)}        ${values.projectName}\n`);
    output.write(`  ${colorize('Product ID', 'cyan', enabled)}  ${toSafeId(values.projectName)}\n`);
    output.write(`  ${colorize('Description', 'cyan', enabled)} ${values.description}\n`);
    output.write(`  ${colorize('Repository', 'cyan', enabled)}  ${values.repository || 'Not configured'}\n`);
    output.write(`  ${colorize('Folder', 'cyan', enabled)}      ${values.newRootName || 'Keep current folder'}\n\n`);
}

function sanitizeProjectName(value) {
    return String(value || '').trim();
}

function toSafeId(value) {
    return sanitizeProjectName(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'cambric-project';
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeProjectReadme(root, projectName, description) {
    const readmePath = path.join(root, 'README.md');
    const projectReadme = `# ${projectName}\n\n${description}\n\n## Getting started\n\n\`\`\`bash\nnpm install\nnpm run doctor\nnpm run build\n\`\`\`\n\n## Notes\n\nThis project is configured for a local-first, privacy-aware release experience with offline-safe browser features and optional GitHub release discovery.\n`;
    fs.writeFileSync(readmePath, projectReadme);
}

function replaceTokensInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [from, to] of Object.entries(replacements)) {
        if (content.includes(from)) {
            content = content.split(from).join(to);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
    }

    return changed;
}

function renameRootIfRequested(root, rootName) {
    if (!rootName || !rootName.trim()) {
        return { root, renamed: false };
    }

    const currentRoot = process.cwd();
    if (path.resolve(root) === path.resolve(currentRoot)) {
        return { root, renamed: false, skipped: true };
    }

    const normalizedTarget = sanitizeProjectName(rootName)
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (!normalizedTarget) {
        return { root, renamed: false };
    }

    const parent = path.dirname(root);
    const targetPath = path.join(parent, normalizedTarget);

    if (targetPath === root) {
        return { root, renamed: false };
    }

    if (fs.existsSync(targetPath)) {
        throw new Error(`Target directory already exists: ${targetPath}`);
    }

    fs.renameSync(root, targetPath);
    return { root: targetPath, renamed: true, skipped: false };
}

async function promptForWizardValues(input = process.stdin, output = process.stdout) {
    if (!process.stdin.isTTY) {
        const buffer = await new Promise((resolve, reject) => {
            let data = '';
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (chunk) => {
                data += chunk;
            });
            process.stdin.on('end', () => resolve(data));
            process.stdin.on('error', reject);
        });

        const lines = (buffer || '').split(/\r?\n/).map((value) => value.trim());
        return {
            projectName: lines[0] || 'My Cambric Product',
            description: lines[1] || 'Local-first Cambric product',
            repository: lines[2] || '',
            newRootName: lines[3] || '',
            confirmed: lines[4] ? !['n', 'no', 'cancel'].includes(lines[4].toLowerCase()) : true
        };
    }

    const useColor = Boolean(output.isTTY && !process.env.NO_COLOR);
    renderWizardHeader(output, useColor);
    const rl = readline.createInterface({ input, output });

    const ask = (prompt, fallback = '') => new Promise((resolve) => {
        rl.question(`${colorize(prompt, 'yellow', useColor)}${fallback ? ` ${colorize(`[${fallback}]`, 'dim', useColor)}` : ''}: `, (answer) => {
            const value = sanitizeProjectName(answer || fallback);
            resolve(value);
        });
    });

    const projectName = await ask('Project name', 'My Cambric Product');
    const description = await ask('Project description (optional)', 'Local-first Cambric product');
    const repository = await ask('Release repository (optional)', '');
    const newRootName = await ask('Rename project folder (optional)', '');
    const values = { projectName, description, repository, newRootName };
    renderWizardSummary(output, values, useColor);
    const confirmation = await ask('Apply these settings? (Y/n)', 'Y');

    rl.close();
    return { ...values, confirmed: !['n', 'no', 'cancel'].includes(confirmation.toLowerCase()) };
}

function setupProject(options = {}) {
    const root = options.root || process.cwd();
    const projectName = sanitizeProjectName(options.projectName || 'Cambric Product');
    const description = sanitizeProjectName(options.description || 'Cambric local-first website');
    const repository = sanitizeProjectName(options.repository || '');
    const productId = sanitizeProjectName(options.productId || toSafeId(projectName));

    if (!projectName) {
        throw new Error('Project name cannot be empty.');
    }

    const configPath = path.join(root, 'config', 'cambric.config.json');
    const manifestPath = path.join(root, 'cambric.manifest.json');
    const siteConfigPath = path.join(root, 'config', 'site.config.js');
    const packagePath = path.join(root, 'package.json');
    const indexPath = path.join(root, 'index', 'index.html');
    const manifestWebPath = path.join(root, 'index', 'manifest.webmanifest');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    config.product.name = projectName;
    config.product.description = description;
    config.product.id = productId;
    config.product.websiteTitle = projectName;
    if (repository) {
        config.release.repository = repository;
    }

    manifest.name = projectName;
    manifest.description = description;
    manifest.productId = productId;
    if (repository) {
        manifest.releaseRepository = repository;
    }

    writeJson(configPath, config);
    writeJson(manifestPath, manifest);

    const replacements = {
        'Cambric Web Template': projectName,
        'Cambric Web Product': projectName,
        'Cambric Product': projectName,
        'Cambric Download': `${projectName} Download`,
        'cambric-web-product': productId,
        'cambric-web-template': productId,
        'web-template': productId,
        'Cambric local-first web template for privacy-preserving release management and product downloads.': description,
        'Cambric local-first website': description,
        'This repository is a local-first, privacy-preserving web foundation for Cambric products.': `This project is a local-first, privacy-preserving web foundation for ${projectName}.`
    };

    const readmePath = path.join(root, 'README.md');
    if (fs.existsSync(readmePath) && fs.readFileSync(readmePath, 'utf8').includes('Cambric Web Template')) {
        writeProjectReadme(root, projectName, description);
    }

    for (const filePath of [
        indexPath,
        manifestWebPath,
        siteConfigPath,
        packagePath,
        path.join(root, 'README.md'),
        path.join(root, 'docs', 'ARCHITECTURE.md'),
        path.join(root, 'docs', 'DEVELOPMENT.md'),
        path.join(root, 'docs', 'DEPLOYMENT.md'),
        path.join(root, 'docs', 'SECURITY.md')
    ]) {
        replaceTokensInFile(filePath, replacements);
    }

    if (packagePath && fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        pkg.name = productId;
        pkg.description = description;
        writeJson(packagePath, pkg);
    }

    for (const relative of ['.template', 'SETUP.md']) {
        const target = path.join(root, relative);
        if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true });
        }
    }

    if (options.newRootName) {
        const result = renameRootIfRequested(root, options.newRootName);
        return {
            projectName,
            productId,
            description,
            config,
            manifest,
            root: result.root,
            renamed: result.renamed,
            skipped: result.skipped || false
        };
    }

    return {
        projectName,
        productId,
        description,
        config,
        manifest,
        root,
        renamed: false,
        skipped: false
    };
}

async function runWizard() {
    const values = await promptForWizardValues();
    if (!values.confirmed) {
        throw new Error('Setup cancelled. No project files were changed.');
    }
    const safeName = toSafeId(values.projectName);
    const projectRoot = process.cwd();

    return setupProject({
        root: projectRoot,
        projectName: values.projectName,
        description: values.description,
        repository: values.repository,
        productId: safeName,
        newRootName: values.newRootName || ''
    });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const hasExplicitArgs = args.length > 0;

    const run = async () => {
        try {
            let result;
            if (hasExplicitArgs) {
                const projectName = args[0] || process.env.CAMBRIC_PROJECT_NAME || 'Cambric Product';
                const description = args[1] || process.env.CAMBRIC_PROJECT_DESCRIPTION || 'Cambric local-first website';
                const repository = args[2] || process.env.CAMBRIC_PROJECT_REPOSITORY || '';
                result = setupProject({
                    root: process.cwd(),
                    projectName,
                    description,
                    repository,
                    productId: toSafeId(projectName)
                });
            } else {
                result = await runWizard();
            }

            console.log(`Project initialized: ${result.projectName}`);
            console.log(`Product ID: ${result.productId}`);
            if (result.renamed) {
                console.log(`Project folder renamed to: ${path.basename(result.root)}`);
            } else if (result.skipped) {
                console.log('Project folder rename skipped because the project is currently active in this directory. Rename it manually after setup.');
            }
        } catch (error) {
            console.error(`Initialization failed: ${error.message}`);
            process.exit(1);
        }
    };

    run();
}

module.exports = { setupProject, sanitizeProjectName, toSafeId, runWizard, replaceTokensInFile, renameRootIfRequested };
