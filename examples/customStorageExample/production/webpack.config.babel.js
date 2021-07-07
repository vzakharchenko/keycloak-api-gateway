const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const path = require('path');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    mode: env,
    context: __dirname,
    target: 'node',
    node: {
        __dirname: false,
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs-module',
        library: 'authorization',
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
            'node_modules',
        ],
    },
    stats: {
        colors: true,
    },
    devtool: false,
    optimization: {
        minimize: false,
        minimizer: [new TerserPlugin({    extractComments: true})],
    }
};

let configs = [
    {
        ...config,
        ...{
            entry: {
                server: path.join(__dirname, 'server.js'),
            },
            output: {
                path: path.join(__dirname, 'dist', 'server'),
                filename: '[name].js',
                libraryTarget: 'commonjs-module',
            },
        }
    },
    {
        ...config,
        ...{
            entry: {
                lambda: path.join(__dirname, 'lambda.js'),
            },
            output: {
                path: path.join(__dirname, 'dist', 'lambda'),
                filename: '[name].js',
                libraryTarget: 'commonjs-module',
            },
            externals: {
                express: 'express',
                "aws-sdk": "commonjs aws-sdk"
            },
        }
    },

];
configs[0].plugins.push(  new CopyPlugin({
    patterns: [
        { from: "../development/ApiConfig.json", to: "ApiConfig.json" },
    ],
    options: {
        concurrency: 100,
    },
}));
// configs[0].plugins.push( new BundleAnalyzerPlugin());
module.exports = configs;
