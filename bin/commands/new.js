"use strict";
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const serialport = require("serialport");
const mkdirp = require("mkdirp");
const exec = require("child_process").exec;
const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = require("colors");
colors.setTheme({
    info: "green",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red"
});

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
            createFiles(destinationPath, runtime, applicationFinished(destinationPath));
        } else if (!isEmpty) {
            readLine.question(`Files already exist at ${destinationPath}.
Would you like to overwrite the existing files?
Type y or n: `, (answer) => {
                    switch (answer.toLowerCase().trim()) {
                        case ("y" || "yes"):
                            console.log(colors.info("You answered yes. Overwriting existing project files."));
                            readLine.close();
                            createFiles(destinationPath, runtime, applicationFinished(destinationPath));
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

function createFiles(destinationPath, runtime, done) {
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
        createDevicesJSON(runtime).then((devices) => {
            write(path.join(destinationPath, "devices.json"), JSON.stringify(devices, null, 2));
            done();
        }).catch((error) => console.error(error));
    });
}

function copy(from, to) {
    write(to, fs.readFileSync(from));
}

function write(path, contents) {
    fs.writeFileSync(path, contents);
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

function clearLine() {
    const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
    const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
    process.stdout.write(MOVE_LEFT + CLEAR_LINE);
    process.stdout.write("");
}

function printLoading(message, loadingChar, count) {
    let i = 0;
    let interval = setInterval(() => {
        if (i === 0) {
            process.stdout.write(message);
        }
        process.stdout.write(loadingChar);
        if (i > count) {
            clearLine();
            process.stdout.write(message);
            i = 0;
        }
        i++;
    }, 400);
    return () => {
        clearInterval(interval);
        clearLine();
    };
}

function getPorts() {
    let clearDevicePrompt;
    return new Promise(
        (resolve, reject) => {
            function portResolver(err, ports) {
                if (err) reject(err);
                const portNames = ports.map((port) => port.comName);
                if (portNames.length > 0) {
                    if(clearDevicePrompt) clearDevicePrompt();
                    resolve(portNames);
                } else {
                    clearDevicePrompt = clearDevicePrompt || printLoading("Plug your device in", ".", 3);
                    serialport.list(portResolver);
                }
            }
            serialport.list(portResolver);
        });
}

function createDevicesJSON(runtime) {
    return getPorts().then((ports) => {
        let questions = [
            {
                type: 'list',
                name: 'port',
                message: 'Select a port:',
                choices: ports,
                default: ports[0]
            },
            {
                type: 'list',
                name: 'baud_rate',
                message: 'Select the baud rate:',
                choices: ['9600', '115200'],
                default: '115200'
            }
        ];

        let deviceJSON = inquirer.prompt(questions).then(answers => {
            const port = answers.port;
            const baud_rate = parseInt(answers.baud_rate);
            const devices = {};

            devices[port] = { baud_rate, runtime };

            return {devices};
        });

        return deviceJSON;
    });
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

module.exports = {
  isDirectoryEmpty
}
