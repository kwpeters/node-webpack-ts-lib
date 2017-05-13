const path = require('path');
const childProcess = require('child_process');
const del = require('del');


const libraryName   = 'myLib';
const buildTypeEnum = {
    DEV:        'dev',
    PRODUCTION: 'production'
};


function getPathWithNpmBin() {
    "use strict";

    // The following will throw if an error occurs.  It is not being caught,
    // because this program should just end.
    const stdout = childProcess.execSync('npm bin');
    return stdout + ":" + process.env.PATH;
}


function getConfig(buildType) {
    "use strict";

    return buildType === buildTypeEnum.PRODUCTION ?
        {
            webpackSwitches:   [],
            nodeOutputFile:    'index-min.js',
            browserOutputFile: libraryName + '-min.js'
        } :
        {
            webpackSwitches:   [],
            nodeOutputFile:    'index.js',
            browserOutputFile: libraryName + '.js'
        };
}


function main() {
    "use strict";

    // If this script is not run within the context of a npm script, we need to
    // add the node_modules/.bin folder to the PATH.
    const augmentedPath = getPathWithNpmBin();

    // Clear out any existing build products.
    del.sync('dist/');

    //
    // Do a development build and a production build.
    //
    [buildTypeEnum.DEV, buildTypeEnum.PRODUCTION]
    .forEach(function (curBuildType) {
        const config = getConfig(curBuildType);

        const options = {
            env: {
                WEBPACK_ENV: curBuildType,
                PATH:        augmentedPath
            }
        };

        const cmd = 'webpack ' +
                    config.webpackSwitches.join(' ') + ' ' +
                    '--config webpack.config.js';

        console.log(`Building ${curBuildType}...`);
        console.log(cmd);
        const stdout = childProcess.execSync(cmd, options);
        console.log(stdout.toString());        // stdout may be a Buffer
        console.log("Build succeeded.");
    });
}


if (require.main === module) {
    process.exit(main());
} else {
    module.exports = {
        buildTypeEnum: buildTypeEnum,
        getConfig:     getConfig
    };
}
