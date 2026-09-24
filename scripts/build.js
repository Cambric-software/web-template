const fs = require('fs');
const path = require('path');
const { validateProject } = require('./doctor.js');

function cleanDirectory(target) {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
    }
}

function buildProject(root = process.cwd()) {
    const validation = validateProject(root);
    if (!validation.ok) {
        throw new Error(`Build validation failed: ${validation.problems.join('; ')}`);
    }

    const distDir = path.join(root, 'dist');
    const args = process.argv.slice(2);
    if (args.includes('--clean')) {
        cleanDirectory(distDir);
    }

    fs.mkdirSync(distDir, { recursive: true });
    fs.cpSync(path.join(root, 'index'), distDir, { recursive: true });
    fs.copyFileSync(path.join(root, 'config', 'cambric.config.json'), path.join(distDir, 'cambric.config.json'));
    fs.copyFileSync(path.join(root, 'cambric.manifest.json'), path.join(distDir, 'cambric.manifest.json'));

    console.log('Build validation succeeded and prepared dist output.');
    return { distDir, validation };
}

if (require.main === module) {
    try {
        buildProject();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { buildProject, cleanDirectory };
