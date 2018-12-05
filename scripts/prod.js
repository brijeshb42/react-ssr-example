const cluster = require('cluster');
const http = require('http');
const { app } = require('../build/server/server').ssrserver;

const server = http.createServer(app);
server.listen(3000);
