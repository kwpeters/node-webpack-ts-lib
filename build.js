const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');


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

    // The command used to run webpack.
    const cmd = 'webpack --config webpack.config.js --progress --colors';

    const buildType = process.argv[2] === 'production' ?
                      buildTypeEnum.PRODUCTION :
                      buildTypeEnum.DEV;
    const buildConfig = getConfig(buildType);

    const options = {
        env: {
            WEBPACK_ENV: buildType,
            PATH:        augmentedPath
        }
    };

    console.log(`Building ${buildType}...`);

    const stdout = childProcess.execSync(cmd, options);
    console.log(Buffer.isBuffer(stdout)? stdout.toString(): stdout);

    // Copy the type definitions file to the appropriate output location.
    // Unfortunately, webpack will not do this for us.
    fs.renameSync(
        path.join(__dirname, 'dist', 'index.d.ts'),
        path.join(buildConfig.outputDir, 'index.d.ts')
    );

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
