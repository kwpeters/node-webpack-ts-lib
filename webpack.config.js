"use strict";

const webpack = require('webpack');
const fs = require('fs');
const build = require('./build');

const nodeModules = {};
fs.readdirSync("node_modules")
.filter(function (curModuleDir) {
    return [".bin"].indexOf(curModuleDir) === -1;
})
.forEach(function (curModuleDir) {
    nodeModules[curModuleDir] = "commonjs " + curModuleDir;
});

const plugins = [];
let buildConfig;
if (process.env.WEBPACK_ENV === "production") {
    plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
    buildConfig = build.getConfig(build.buildTypeEnum.PRODUCTION);
} else {
    buildConfig = build.getConfig(build.buildTypeEnum.DEV);
}

const nodeConfig = {
    entry:  "./src/index.ts",
    target: "node",
    output: {
        libraryTarget: "commonjs2",
        path:          buildConfig.outputDir,
        filename:      'index.js'
    },
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins:   plugins,
    externals: nodeModules
};

const browserConfig = {
    entry:  "./src/index.ts",
    target: "web",
    output: {
        libraryTarget: "var",
        library:       "myLib",
        path:          buildConfig.outputDir,
        filename:      'myLib.js'
    },
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins:   plugins,
    externals: nodeModules
};

module.exports = [nodeConfig, browserConfig];
