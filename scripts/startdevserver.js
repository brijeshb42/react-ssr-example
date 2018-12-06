const http = require('http');
const path = require('path');
const debug = require('debug');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../configs/webpack.server');
const configClient = require('../configs/webpack.client');
const { srcPath } = require('../configs/common');

const log = debug('dev:server');
const logClient = debug('dev:client');

const serverConfig = config();
const serverCompiler = webpack(serverConfig);
const clientPort = process.env.FE_PORT || 3001;
const clientConfig = configClient({
  port: clientPort,
});
const clientCompiler = webpack(clientConfig);

let started = false;
const serverPath = path.join(serverCompiler.options.output.path, 'server.js');

let webpackDevServer;
// Reference to the main backend server
let httpServer;
// To unmount previous routing listeners
let expressAppRef;
// Store client connections to inform them when backend changed successfully
// or errored.
let sseConnections = [];

// Mount this middleware on a route on which the client will listen
// for events.
function sseMiddleware(req, res, next) {
  log('Received SSE connection');
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  sseConnections.push(res);
}

function sendEventToClients(type, data) {
  sseConnections.forEach(conn => {
    conn.write(`data: ${JSON.stringify({type, data})}\n\n`);
  });
}

function closeOldConnections() {
  sseConnections.forEach(conn => {
    conn.end();
  });
  sseConnections = [];
}

function startServer(err, stats) {
  if (err || stats.hasErrors()) {
    sendEventToClients('error');
    log('Error encountered. Still running older version');
    return;
  }

  if (started) {
    log('Webpack reloaded');
    // clear require cache so that we can require our module with new changes
    delete require.cache[require.resolve(serverPath)];
    const { default: expressapp, start: mountApp } = require(serverPath);
    sendEventToClients('refresh');
    // Force close connections as EventSource tries to reconnect on its own
    closeOldConnections();
    mountApp([{
      route: '/devstream',
      when: 'pre',
      middleWare: sseMiddleware,
    }]);
    httpServer.removeListener('request', expressAppRef);
    httpServer.on('request', expressapp);
    expressAppRef = expressapp;
    log('express router swapped');
    return;
  }

  started = true;
  const { default: expressapp, start: mountApp } = require(serverPath);
  expressAppRef = expressapp;
  mountApp([{
    route: '/devstream',
    when: 'pre',
    middleWare: sseMiddleware,
  }]);

  // Start http server the first time when webpack build finishes
  // and then reuse this server to mount refreshed express app.
  httpServer = http.createServer(expressapp);
  const port = process.env.BE_PORT ? parseInt(process.env.BE_PORT, 10) : 3000;
  httpServer.listen(port);
  log(`Backend running on http://localhost:${port}`);
}

log('Starting webpack');
serverCompiler.watch(
  serverConfig.watchOptions || {
    watch: true,
    aggregateTimeout: 200,
  },
  startServer
);

clientConfig.entry.client.unshift(`webpack-dev-server/client?http://localhost:${clientPort}/`, 'webpack/hot/only-dev-server');
logClient('Starting webpack');
webpackDevServer = new WebpackDevServer(
  clientCompiler,
  Object.assign(clientConfig.devServer || {}, {
    clientLogLevel: 'info',
    hot: true,
    hotOnly: true,
    noInfo: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    },
  })
);

webpackDevServer.listen(clientPort, 'localhost', () => {
  logClient('webpack-dev-server started on http://localhost:' + clientPort);
});
