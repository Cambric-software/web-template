const path = require('path');
const { spawnSync } = require('child_process');
const { validateProject } = require('./doctor.js');
const { buildProject, cleanDirectory } = require('./build.js');

const root = path.join(__dirname, '..');
const checks = [
    ['core tests', path.join(root, 'tests', 'cambric-core.test.js')],
    ['basic tests', path.join(root, 'tests', 'basic.test.js')]
];

function runCheck(name, script) {
    const result = spawnSync(process.execPath, [script], {
        cwd: root,
        stdio: 'inherit'
    });

    if (result.status !== 0) {
        throw new Error(`${name} failed.`);
    }
}

function verifyProject() {
    const validation = validateProject(root);
    if (!validation.ok) {
        throw new Error(`Doctor failed: ${validation.problems.join('; ')}`);
    }

    for (const [name, script] of checks) {
        runCheck(name, script);
    }

    const build = buildProject(root);
    cleanDirectory(build.distDir);
    console.log('Cambric verification passed.');
}

if (require.main === module) {
    try {
        verifyProject();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { verifyProject };
