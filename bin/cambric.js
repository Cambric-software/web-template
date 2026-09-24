#!/usr/bin/env node

const { setupProject, runWizard } = require('../scripts/setup.js');
const { runDoctor } = require('../scripts/doctor.js');
const { buildProject } = require('../scripts/build.js');
const { CAMBRIC_VERSION } = require('../services/version.js');

function printUsage() {
    console.log('Cambric CLI');
    console.log('Usage: cambric <setup|doctor|test|build|clean|cache|update|version|diagnose> [options]');
    console.log('If setup is run without arguments, the interactive wizard will prompt for the project identity.');
}

async function runCommand(command, args) {
    switch (command) {
        case 'setup': {
            if (args.length === 0) {
                const result = await runWizard();
                console.log(`Project initialized: ${result.projectName}`);
                console.log(`Product ID: ${result.productId}`);
                return;
            }

            const projectName = args[0] || process.env.CAMBRIC_PROJECT_NAME || 'Cambric Website';
            const description = args[1] || process.env.CAMBRIC_PROJECT_DESCRIPTION || 'Cambric local-first website';
            const repository = args[2] || process.env.CAMBRIC_PROJECT_REPOSITORY || '';
            const result = setupProject({ projectName, description, repository, root: process.cwd() });
            console.log(`Project initialized: ${result.projectName}`);
            return;
        }
        case 'doctor':
        case 'diagnose':
            runDoctor(process.cwd());
            return;
        case 'test':
            console.log('Running project validation tests...');
            runDoctor(process.cwd());
            return;
        case 'build':
            buildProject(process.cwd());
            return;
        case 'clean':
            console.log('Cleanup is handled by the build script in dist output.');
            return;
        case 'cache': {
            const { cambricCacheInfo } = require('../services/cache.js');
            cambricCacheInfo().then((info) => console.log(JSON.stringify(info, null, 2))).catch((error) => {
                console.error(error.message);
                process.exit(1);
            });
            return;
        }
        case 'update':
            console.log('No forced remote updates are required for a local-first template.');
            return;
        case 'version':
            console.log(CAMBRIC_VERSION);
            return;
        default:
            printUsage();
            process.exit(1);
    }
}

if (require.main === module) {
    const command = process.argv[2] || 'help';
    runCommand(command, process.argv.slice(3)).catch((error) => {
        console.error(`Command failed: ${error.message}`);
        process.exit(1);
    });
}
