const fs = require('fs');
const path = require('path');
const { validateProject } = require('./doctor.js');

function buildProject(root = process.cwd()) {
    const validation = validateProject(root);
    if (!validation.ok) {
        throw new Error(`Build validation failed: ${validation.problems.join('; ')}`);
    }

    const source = path.join(root, 'index');
    const dist = path.join(root, 'dist');

    fs.rmSync(dist, { recursive: true, force: true });
    fs.cpSync(source, dist, { recursive: true });

    for (const required of ['index.html', 'components.html', '404.html', 'config.json']) {
        if (!fs.existsSync(path.join(dist, required))) {
            throw new Error(`Build output is missing ${required}.`);
        }
    }

    return { distDir: dist, validation };
}

if (require.main === module) {
    try {
        const { distDir } = buildProject();
        console.log(`Built ${path.relative(process.cwd(), distDir)} from index/.`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { buildProject };
