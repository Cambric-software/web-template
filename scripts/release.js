const fs = require('fs');
const path = require('path');
const { getVersionInfo } = require('../services/version.js');

function generateReleaseMetadata(root = process.cwd()) {
    const configPath = path.join(root, 'config', 'cambric.config.json');
    const manifestPath = path.join(root, 'cambric.manifest.json');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = getVersionInfo();

    const metadata = {
        version: config.product.version || manifest.version,
        productId: config.product.id || manifest.productId,
        productName: config.product.name || manifest.name,
        releaseRepository: config.release.repository,
        publishedAt: new Date().toISOString(),
        build: version,
        changelog: {
            version: config.product.version || manifest.version,
            date: new Date().toISOString(),
            additions: ['Cambric web template foundation', 'Central configuration', 'Release validation'],
            changes: ['Improved diagnostics and cache management'],
            fixes: ['Fixed malformed template config and manifest values'],
            security: ['Secret scanning support and safe URL validation'],
            breaking: []
        }
    };

    const outputPath = path.join(root, 'dist', 'release-metadata.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`Release metadata written to ${outputPath}`);
    return metadata;
}

if (require.main === module) {
    try {
        generateReleaseMetadata();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { generateReleaseMetadata };
