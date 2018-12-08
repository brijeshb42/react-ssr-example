const path = require('path');
const webpack = require('webpack');
const { resolve } = require('./common');

module.exports = function(options) {
  return {
    mode: 'development',
    target: 'web',
    devtool: 'cheap-eval-source-map',
    entry: {
      client:  [
        './src/client/index.ts',
      ],
    },
    resolve,
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }, {
        exclude: /node_modules/,
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.dirname(__filename),
              },
            },
          },
        ],
      }],
    },
    output: {
      path: path.join(process.cwd(), 'build/client'),
      filename: '[name].js',
      publicPath: options.port ? `//localhost:${options.port}/` : '/',
    },
    plugins: [
      new webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          },
        },
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };  
}
