'use strict';
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

const {createDevicesJSON} = require('./devices');
const {write, copy, isDirectoryEmpty} = require('./core/file');
const colors = require('./core/colors.theme');
const {shouldOverwrite} = require('./core/cli');

const RUNTIMES = {
    espruino: "1.86"
};

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

    return makeDirectory(destinationPath + "/scripts").then(() => {
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

        /* Create devices.json and finish */
        const deviceJSONOptions = Object.create({}, options, {destinationPath});
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
            push: "node ./scripts/push"
        },
        devDependencies: {
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