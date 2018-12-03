const path = require('path');
const debug = require('debug');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const nodemon = require('nodemon');

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
let devServer;

function startServer() {
  if (started) {
    return;
  }

  log('Webpack server build finished. Starting nodemon');
  started = true;
  const serverPath = path.join(serverCompiler.options.output.path, 'server.js');
  log(`nodemon is watching - ${serverPath}`);

  nodemon({
    script: serverPath,
    watch: [
      path.join(srcPath, 'shared'),
      serverPath,
    ],
    nodeArgs: process.argv.slice(2),
  }).on('quit', () => {
    if (devServer) {
      logClient('Closing client dev server');
      devServer.close(process.exit);
    } else {
      process.exit();
    }
    log('Closed!');
  }).on('restart', () => {
    log('nodemon restarted...');
  });
  log('nodemon started');
}

log('Starting webpack');
serverCompiler.watch(serverConfig.watchOptions || {}, startServer);
clientConfig.entry.client.unshift(`webpack-dev-server/client?http://localhost:${clientPort}/`, 'webpack/hot/only-dev-server');
logClient('Starting webpack');
devServer = new WebpackDevServer(
  clientCompiler,
  Object.assign(clientConfig.devServer || {}, {
    historyApiFallback: false,
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
