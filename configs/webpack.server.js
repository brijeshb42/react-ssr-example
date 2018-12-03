const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { resolve } = require('./common');

module.exports = function(options) {
  return {
    mode: 'development',
    target: 'node',
    entry: {
      server:  [
        './src/server/index.ts',
      ],
    },
    resolve,
    watch: true,
    externals: [
      nodeExternals({}),
    ],
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }, {
        test: /\.(scss|css)$/,
        use: 'ignore-loader'
      }],
    },
    plugins: [
      new webpack.IgnorePlugin(/\.(css|less|scss)$/),
      new webpack.DefinePlugin({
        process: {
          env: JSON.stringify(process.env),
        },
        __ISOMORPHIC__: JSON.stringify(true),
      }),
    ],
    output: {
      path: path.join(process.cwd(), 'build/server'),
      filename: '[name].js',
    },
    node: {
      __dirname: true,
      __filename: true,
    },
  };  
}
