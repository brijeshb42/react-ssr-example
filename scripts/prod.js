const http = require('http');
const { app } = require('../build/server/server');

const server = http.createServer(app);
server.listen(3000);
