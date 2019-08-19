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

// Initial request handler when webpack has not started yet.
let initialListeners = [];
function initialRequestListener(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  res.write('<h1>Please wait while webpack is starting</h1>');
  // res.end();
  initialListeners.push(res);
}
function sendToListeners(message) {
  initialListeners.forEach(conn => conn.write(message));
}
function closeListeners() {
  initialListeners.forEach(conn => conn.end());
  initialListeners = [];
}

function startServer(err, stats) {
  let errStr;
  if (err) {
    log(err.stack || err);
    if (err.details) {
      errStr = err.details;
    }
  } else if (stats.hasErrors()) {
    const info = stats.toJson();
    errStr = info.errors;
  }

  if (errStr) {
    sendEventToClients('error', errStr);
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

  // Remove the catchall listener and use the actual express app
  httpServer.removeListener('request', initialRequestListener);
  httpServer.on('request', expressapp);
  log(`Webpack build finished`);
  // Refresh clients as now our express app is loaded
  // and ready to serve
  sendToListeners('Webpack done<script>setTimeout(function() {window.location.reload();}, 1000)</script>');
  closeListeners();
}

// Start http server as early as possible so that clients
// can start connecting even though webpack build is still
// in progress or not even started.
httpServer = http.createServer(initialRequestListener);
const port = process.env.BE_PORT ? parseInt(process.env.BE_PORT, 10) : 3000;
httpServer.listen(port);
log(`Http server started on - http://localhost:${port}`);

log('Starting webpack');
sendToListeners('Starting webpack');
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
    disableHostCheck: true,
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
