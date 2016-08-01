#!/usr/bin/env node
'use strict';

const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const mkdirp = require("mkdirp");
const cliPackage = require("../package.json");
const exec = require("child_process").exec;

const argv = require("yargs")
    .version(cliPackage.version)
    .command(require("./commands/new"))
    .demand(1)
    .help()
    .argv;

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

function createApplication(destinationPath) {
    isDirectoryEmpty(destinationPath, (isEmpty) => {
        if (isEmpty) {
            createFiles(destinationPath, applicationFinished(destinationPath));
        } else {
            //TODO Confirm if user wants to overwrite
            if(false) {
                console.error("No project files were changed.");
                process.exit(1);
            } else {
                createFiles(destinationPath, applicationFinished(destinationPath));
            }
        }
    });
}

function applicationFinished(destinationPath) {
    return (err) => {
	    if (err) throw err;
	    console.log(`To install the project dependencies:\n\tcd ${destinationPath} && npm install`);
	    console.log(`To upload to your device:\n\tcd ${destinationPath} && npm run push`);
    };
}

function createFiles(destinationPath, done) {
    const app_name = path.basename(path.resolve(destinationPath));
    mkdirp(destinationPath + "/scripts", (err) => {

        /* Copy templates */
        const templatesPath = path.join(__dirname, "..", "templates");
        const scriptPath = path.join(templatesPath, argv.runtime, "scripts");
        fs.readdir(scriptPath, (err, files) => {
            if (err) return done(err);
            files.forEach(file => copy(path.join(scriptPath, file), path.join(destinationPath, "scripts", file)));
        });

        /* Create package.json for project */
        const pkg = createPackageJSON(app_name);
        write(path.join(destinationPath,"package.json"), JSON.stringify(pkg, null, 2));
        copy(path.join(templatesPath, 'main.js'), path.join(destinationPath, 'main.js'));
        copy(path.join(templatesPath, 'dot-gitignore'), path.join(destinationPath, '.gitignore'));
        createDevicesJSON().then(function(devices, error){
            if (error) return done(error);
            write(path.join(destinationPath,"devices.json"), JSON.stringify(devices, null, 2));
            done();
        });
    });
}

function copy(from, to) {
    write(to, fs.readFileSync(from));
}

function write(path, contents) {
    fs.writeFileSync(path, contents);
}

function createPackageJSON(app_name) {
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

    pkg.engines[argv.runtime] = RUNTIMES[argv.runtime];

    return pkg;
}

function createDevicesJSON(){
    var questions = [
        {
            type: 'list',
            name: 'port',
            message: 'Select a port:',
            choices: ['COM5', 'COM7'],
            default: 'COM5'
        },
        {
            type: 'list',
            name: 'baud',
            message: 'Select the baud rate:',
            choices: ['9600', '115200'],
            default: '115200'
        }
    ];

    var deviceJSON = inquirer.prompt(questions).then(function(answers){
        const port = answers.port;
        const baud = parseInt(answers.baud);

        var devices = {
            devices: {}   
        }

        devices.devices[port] = {
            'baud_rate': baud,
            'runtime': argv.runtime
        }

        return devices;
    });

    return deviceJSON;
}

createApplication(argv.path);
