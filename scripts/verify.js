const path = require('path');
const { spawnSync } = require('child_process');
const { runDoctor } = require('./doctor.js');
const { buildProject } = require('./build.js');

const root = path.join(__dirname, '..');

function runTest() {
    const result = spawnSync(process.execPath, [path.join(root, 'tests', 'site.test.js')], {
        cwd: root,
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        throw new Error('Site tests failed.');
    }
}

function verifyProject() {
    const doctor = runDoctor(root);
    if (!doctor.ok) {
        throw new Error('Doctor failed.');
    }

    runTest();
    const { distDir } = buildProject(root);
    console.log(`Build output: ${path.relative(root, distDir)}`);
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
