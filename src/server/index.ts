import http from 'http';
import debug from 'debug';
import app from './app';

const log = debug('dev:express');
const server = http.createServer(app);
const port = process.env.BE_PORT ? parseInt(process.env.BE_PORT, 10) : 3000;

log(`Open http://localhost:${port} in your browser.`);
server.listen(port);
