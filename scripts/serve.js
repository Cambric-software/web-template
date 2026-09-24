const fs = require('fs');
const http = require('http');
const path = require('path');
const { buildProject } = require('./build.js');

const root = path.join(__dirname, '..');
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json'
};

function serveFile(request, response) {
    const requestedPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, 'dist', relativePath);
    const distRoot = path.resolve(root, 'dist');

    if (!filePath.startsWith(`${distRoot}${path.sep}`) && filePath !== distRoot) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
    }

    response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
}

try {
    const { distDir } = buildProject(root);
    const server = http.createServer(serveFile);
    server.listen(port, () => {
        console.log(`Cambric website preview: http://localhost:${port}`);
        console.log(`Serving: ${distDir}`);
    });
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
