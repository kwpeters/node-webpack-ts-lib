"use strict";

const webpack = require('webpack');
const build = require('./build');

const modules = Object.keys(require('./package.json').dependencies);

const nodeExternalPackages = modules.reduce(function (acc, curModule) {
    //
    // When building for Node.js, we should not include dependent packages.
    // Dependent packages will be automatically installed using npm and the
    // package.json dependencies mechanism.
    //
    acc[curModule] = "commonjs " + curModule;
    return acc;
}, {});

//
// When packaging for the web/browsers, we will include all dependencies in the
// bundle.
// Note: If the TypeScript configuration for this project is targeting anything
// less than "es2015", tree shaking will not be done and dependent modules will
// be include in their entirety.
//
const browserExternalPackages = {};
//
// If you want to bundle for the web without this module's dependencies, browser
// clients will have to include this package's dependencies before pulling in
// this module.  To do this, uncomment the following code.
//
// const browserExternalPackages = modules.reduce(function (acc, curModule) {
//     acc[curModule] = curModule;
//     return acc;
// }, {});

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
    externals: nodeExternalPackages
};

const browserConfig = {
    entry:  "./src/index.ts",
    target: "web",
    output: {
        libraryTarget: "var",
        library:       "myLib",
        path:          buildConfig.outputDir,
        filename:      'myLib.js'   // TODO: The production version should just be .min.js
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
    externals: browserExternalPackages
};

module.exports = [nodeConfig, browserConfig];
