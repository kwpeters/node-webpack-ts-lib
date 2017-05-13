const path = require('path');
const childProcess = require('child_process');
const del = require('del');


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
           {outputDir: path.join(__dirname, "dist", 'production')} :
           {outputDir: path.join(__dirname, "dist", 'dev')};
}


function main() {
    "use strict";

    // If this script is not run within the context of a npm script, we need to
    // add the node_modules/.bin folder to the PATH.
    const augmentedPath = getPathWithNpmBin();

    // Delete the current type definitions file
    del.sync(['dist/index.d.ts']);

    // The command used to run webpack.
    const cmd = 'webpack --config webpack.config.js --progress --colors';

    const buildType = process.argv[2] === 'production' ?
                      buildTypeEnum.PRODUCTION :
                      buildTypeEnum.DEV;
    const buildConfig = getConfig(buildType);

    // Clean the output directory.
    del.sync(buildConfig.outputDir);

    const options = {
        env: {
            WEBPACK_ENV: buildType,
            PATH:        augmentedPath
        }
    };

    console.log(`Building ${buildType}...`);

    const stdout = childProcess.execSync(cmd, options);
    console.log(Buffer.isBuffer(stdout)? stdout.toString(): stdout);

    console.log("Build succeeded.");
}


if (require.main === module) {
    process.exit(main());
} else {
    module.exports = {
        buildTypeEnum: buildTypeEnum,
        getConfig:     getConfig
    };
}
