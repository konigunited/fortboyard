const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const server = http.createServer((req, res) => {
    let filePath = decodeURIComponent(req.url);
    if (filePath === '/' || filePath === '') filePath = '/index.html';
    filePath = filePath.split('?')[0];
    const fullPath = path.join(__dirname, filePath);

    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Not Found</h1>');
            console.log('404:', filePath);
            return;
        }

        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('500 - Server Error');
                console.log('500:', filePath);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 
                'Content-Type': contentType, 
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
            console.log('OK:', filePath);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n========================================');
    console.log('SERVER STARTED');
    console.log('========================================\n');
    console.log('Local:   http://localhost:' + PORT);
    console.log('Network: http://' + localIP + ':' + PORT);
    console.log('\nPress Ctrl+C to stop\n');
});

server.on('error', (err) => {
    console.log('ERROR:', err.message);
});

process.on('SIGINT', () => {
    console.log('\nServer stopped');
    process.exit(0);
});
