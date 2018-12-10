const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { resolve } = require('./common');

module.exports = function(options) {
  return {
    mode: 'development',
    target: 'node',
    devtool: 'cheap-module-eval-source-map',
    entry: {
      server:  [
        './src/server/index.ts',
      ],
    },
    resolve,
    externals: [
      nodeExternals({}),
    ],
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
        }],
        exclude: /node_modules/,
      }, {
        exclude: /node_modules/,
        test: /\.(c|sc|le)ss$/,
        use: [{
          loader: 'ignore-loader',
        }],
      }],
    },
    plugins: [
      new webpack.DefinePlugin({
        process: {
          env: JSON.stringify(process.env),
        },
        __ISOMORPHIC__: JSON.stringify(true),
        BASE_DIR: JSON.stringify(path.resolve(path.dirname(__dirname))),
      }),
    ],
    output: {
      path: path.join(process.cwd(), 'build/server'),
      filename: '[name].js',
      libraryTarget: 'commonjs',
    },
    node: {
      __dirname: true,
      __filename: true,
    },
  };  
}
