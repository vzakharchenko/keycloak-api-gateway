const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const path = require('path');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
  mode: env,
  context: __dirname,
  entry: {
    server: path.join(__dirname, 'server.js'),
    lambda: path.join(__dirname, 'lambda.js'),
  },
  target: 'node',
  node: {
    __dirname: false,
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs-module',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: ['babel-loader'],
    },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      '.': '__dirname',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ProgressBarPlugin(),
  ],
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
  stats: {
    colors: true,
  },
  devtool: false,
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  externals: {
    express: 'express',
  },
};

module.exports = config;
