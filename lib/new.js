'use strict';
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

const {createDevicesJSON} = require('./devices');
const {write, copy, isDirectoryEmpty} = require('./core/file');
const colors = require('./core/colors-theme');
const {shouldOverwrite} = require('./core/cli-helpers');

const RUNTIMES = {
    espruino: "1.88"
};

function checkForTilda(destinationPath) {
    /**
     If the first part of the path contains a ~,
     we'll assume the user intends for their project to install
     relative to their home directory on a Unix machine and throw an error.
   */
    if (destinationPath.split('/')[0].includes('~')) {
        console.log(colors.error(`
  Uh-oh, check your desired project path!
  It looks like you made a reference to your home directory: ~/
  Due to cross platform compatibility with non-Unix systems, that causes some problems.
  Try again using absolute paths like /Users/<your username>/path/to/project
`));
        throw new Error(`Bad path, we're sorry...`);
    }

    /**
      If any other part of the path contains a ~,
      we'll just give them a helpful warning.
    */
    if (destinationPath.includes('~')) {
        console.log(colors.warn(`
  Be careful, it looks like your project path contains a "~".
  If you remove this directory, be very careful about running "rm -rf \\~"
  You could accidentally destroy your home directory!
  `));
    }
}

function createApplication(options) {
    const {path: destinationPath, runtime} = options;
    return isDirectoryEmpty(destinationPath)
        .then(isEmpty => {
            if (isEmpty) {
                return true;
            } else {
                return shouldOverwrite(destinationPath);
            }
        })
        .then(proceed => {
            if (proceed) {
                return createFiles(options).then(() => {
                    projectCreated(destinationPath);
                });
            }
        });
}

function projectCreated(destinationPath) {
    const successMessage = `To install the project dependencies:
    cd ${destinationPath} && npm install
To upload to your device:
    cd ${destinationPath} && npm run push`;

    console.log(colors.help(successMessage));
}

function makeDirectory(directory) {
    return new Promise((resolve, reject) => {
        mkdirp(directory, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function createFiles(options) {
    const {port, baud_rate, path: destinationPath, runtime} = options;
    const app_name = path.basename(path.resolve(destinationPath));
    const templatesPath = path.join(__dirname, "..", "templates");
    const scriptPath = path.join(templatesPath, runtime, "scripts");

    checkForTilda(destinationPath);

    return makeDirectory(path.join(destinationPath, 'scripts'))
        .then(() => makeDirectory(path.join(destinationPath, 'build')))
        .then(() => {
        /* Copy templates */
        fs.readdir(scriptPath, (err, files) => {
            if (err) throw err;
            files.forEach(file => copy(path.join(scriptPath, file), path.join(destinationPath, "scripts", file)));
        });

        /* Create package.json for project */
        const pkg = createPackageJSON(app_name, runtime);
        write(path.join(destinationPath, "package.json"), JSON.stringify(pkg, null, 2));
        copy(path.join(templatesPath, 'main.js'), path.join(destinationPath, 'main.js'));
        copy(path.join(templatesPath, 'dot-gitignore'), path.join(destinationPath, '.gitignore'));
        copy(path.join(templatesPath, 'dot-gitattributes'), path.join(destinationPath, '.gitattributes'));

        /* Create devices.json and finish */
        const deviceJSONOptions = { port, baud_rate, runtime, destinationPath };
        return createDevicesJSON(deviceJSONOptions);
    });
}

function createPackageJSON(app_name, runtime) {
    const pkg = {
        name: app_name,
        version: '0.0.0',
        private: true,
        main: 'main.js',
        scripts: {
            dev: "node ./scripts/upload development && npm run repl",
            deploy: "node ./scripts/upload production",
            repl: "node ./scripts/repl"
        },
        devDependencies: {
            //TODO: REPLACE WITH LIVE VERSIONS WHEN RELEASED @chalkers
            "thingssdk-deployer": "github:thingssdk/thingssdk-deployer",
            "thingssdk-espruino-strategy": "github:thingssdk/thingssdk-espruino-strategy"
        },
        engines: {

        }
    };

    pkg.engines[runtime] = RUNTIMES[runtime];

    return pkg;
}

module.exports = {
    createApplication
};