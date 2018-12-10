const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const { resolve } = require('./common');

module.exports = function(options) {
  return {
    mode: 'production',
    target: 'web',
    devtool: 'source-map',
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
          {
            loader: MiniCssExtractPlugin.loader,
          },
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
      filename: '[name].[contenthash].js',
      publicPath: '/static/',
      jsonpFunction: 'wjp',
      hotUpdateFunction: 'whu',
    },
    optimization: {
      runtimeChunk: {
        name: 'runtime',
      },
      moduleIds: 'hashed',
      minimize: true,
      providedExports: true,
      sideEffects: true,
      splitChunks: {
        automaticNameDelimiter: '.',
        chunks: 'all',
      },
    },
    plugins: [
      new ManifestPlugin(),
      new OptimizeCssAssetsPlugin({
        // assetNameRegExp: /\.optimize\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
        chunkFilename: "[name].[contenthash].css"
      }),
      new webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          },
        },
      }),
    ],
  };  
}
