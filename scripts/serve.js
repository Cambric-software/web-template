const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.join(__dirname, '..', 'index');
const port = Number(process.env.PORT || 4173);

const MIME = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
    '.txt': 'text/plain; charset=utf-8'
};

function send(response, status, body, type = 'text/plain; charset=utf-8') {
    response.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store'
    });
    response.end(body);
}

function serve(request, response) {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
    } catch (error) {
        send(response, 400, 'Bad request');
        return;
    }

    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(root, relative);

    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
        send(response, 403, 'Forbidden');
        return;
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        const notFound = path.join(root, '404.html');
        send(response, 404, fs.readFileSync(notFound), MIME['.html']);
        return;
    }

    response.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
}

http.createServer(serve).listen(port, () => {
    console.log(`Cambric website: http://localhost:${port}`);
    console.log(`Serving: ${root}`);
});
