"use strict";
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const exec = require("child_process").exec;
const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const createDevicesJSON = require('../../lib/devices').createDevicesJSON;
const write = require('../../lib/common').write;
const colors = require('../../lib/colors.theme');

const RUNTIMES = {
    espruino: "1.86"
};

const NO_SUCH_FILE_OR_DIRECTORY_ERROR_CODE = 'ENOENT';

function isDirectoryEmpty(path, callback) {
    fs.readdir(path, (err, files) => {
        if (err && err.code !== NO_SUCH_FILE_OR_DIRECTORY_ERROR_CODE) {
            throw err;
        } else {
            const noFilesPresent = !files || !files.length;
            callback(noFilesPresent);
        }
    });
}

function createApplication(argv) {
    const destinationPath = argv.path;
    const runtime = argv.runtime;
    isDirectoryEmpty(destinationPath, (isEmpty) => {
        if (isEmpty) {
            createFiles(argv, applicationFinished(destinationPath));
        } else if (!isEmpty) {
            readLine.question(`Files already exist at ${destinationPath}.
Would you like to overwrite the existing files?
Type y or n: `, (answer) => {
                    switch (answer.toLowerCase().trim()) {
                        case ("y" || "yes"):
                            console.log(colors.info("You answered yes. Overwriting existing project files."));
                            readLine.close();
                            createFiles(argv, applicationFinished(destinationPath));
                            break;
                        case ("n" || "no"):
                            console.log(colors.warn("No project files were changed. Aborting new project creation."));
                            readLine.close();
                            process.exit(1);
                            break;
                        default:
                            console.error(colors.error("I don't understand your input. No project files were changed. Aborting new project creation."));
                            readLine.close();
                            process.exit(1);
                    }
                });
        }
    });
}

function applicationFinished(destinationPath) {
    return (err) => {
        if (err) throw err;
        console.log(colors.help(`To install the project dependencies:
    cd ${destinationPath} && npm install
To upload to your device:
    cd ${destinationPath} && npm run push`));
        process.exit(0);
    };
}

function createFiles(options, runtime, done) {
    const {port, baud_rate} = options;
    const destinationPath = options.path;
    const app_name = path.basename(path.resolve(destinationPath));

    mkdirp(destinationPath + "/scripts", (err) => {

        /* Copy templates */
        const templatesPath = path.join(__dirname, "..", "..", "templates");
        const scriptPath = path.join(templatesPath, runtime, "scripts");
        fs.readdir(scriptPath, (err, files) => {
            if (err) return done(err);
            files.forEach(file => copy(path.join(scriptPath, file), path.join(destinationPath, "scripts", file)));
        });

        /* Create package.json for project */
        const pkg = createPackageJSON(app_name, runtime);
        write(path.join(destinationPath, "package.json"), JSON.stringify(pkg, null, 2));
        copy(path.join(templatesPath, 'main.js'), path.join(destinationPath, 'main.js'));
        copy(path.join(templatesPath, 'dot-gitignore'), path.join(destinationPath, '.gitignore'));
        /* Create devices.json and finish */
        createDevicesJSON(port, baud_rate, runtime).then(devices => {
            write(path.join(destinationPath, "devices.json"), JSON.stringify(devices, null, 2));
        }).then(done).catch((error) => console.error(colors.error(error)));
    });
}

function copy(from, to) {
    write(to, fs.readFileSync(from));
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

/**
 * Yargs required exports
 */

exports.command = "new <path>";

exports.describe = 'create an applicaiton at a given path';

exports.builder = {
    runtime: {
        default: "espruino"
    }
};

exports.handler = createApplication;

exports.testFunctions = {
    isDirectoryEmpty
};
