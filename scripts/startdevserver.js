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

let started = false, error = false;
const serverPath = path.join(serverCompiler.options.output.path, 'server.js');
let devServer;
let httpServer;
let expressApp;

function startServer(err, stats) {
  if (err || stats.hasErrors()) {
    log('Error encountered. Still running older version');
    return;
  }
  if (started) {
    log('Webpack reloaded');
    delete require.cache[require.resolve(serverPath)];
    const { app: expressapp } = require(serverPath);
    httpServer.removeListener('request', expressApp);
    httpServer.on('request', expressapp);
    expressApp = expressapp;
    log('express router swapped');
    return;
  }

  started = true;
  const { app: expressapp } = require(serverPath);
  expressApp = expressapp;
  httpServer = http.createServer(expressapp);
  const port = process.env.BE_PORT ? parseInt(process.env.BE_PORT, 10) : 3000;
  httpServer.listen(port);
  log(`Backend running on http://localhost:${port}`);
}

log('Starting webpack');
serverCompiler.watch(serverConfig.watchOptions || {
  watch: true,
  aggregateTimeout: 200,
}, startServer);

clientConfig.entry.client.unshift(`webpack-dev-server/client?http://localhost:${clientPort}/`, 'webpack/hot/only-dev-server');
logClient('Starting webpack');
devServer = new WebpackDevServer(
  clientCompiler,
  Object.assign(clientConfig.devServer || {}, {
    clientLogLevel: 'info',
    hot: true,
    hotOnly: true,
    noInfo: true,
    overlay: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    },
  })
);

devServer.listen(clientPort, 'localhost', () => {
  logClient('webpack-dev-server started on http://localhost:' + clientPort);
});
