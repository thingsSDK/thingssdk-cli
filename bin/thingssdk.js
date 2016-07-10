#!/usr/bin/env node
'use strict';

const path = require("path");
const fs = require("fs");
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
    espruino: "1.85"
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

function createApplicaiton(destinationPath) {   
    isDirectoryEmpty(destinationPath, (isEmpty) => {
        if (isEmpty) {
            createFiles(destinationPath, applicationFinished(destinationPath));
        } else {
            //TODO Confirm if user wants to overwrite
            if(false) {
                console.error("No project was created.");
                process.exit(1);
            } else {
                createFiles(destinationPath, applicationFinished(destinationPath));
            }
        }
    });
}

function applicationFinished(destinationPath) {
    return (err) => {
       if(err) throw err;
       console.log(`To install the project dependencies:\n\tcd ${destinationPath} && npm install`)
       console.log(`To start your project:\n\tcd ${destinationPath} && npm staart`);
    };
}            

function createFiles(destinationPath, done) {
    const app_name = path.basename(path.resolve(destinationPath));
    mkdirp(destinationPath + "/scripts", (err) => {
    
        /* Copy templates */
        const scriptPath = path.join(__dirname, "..", "templates", argv.runtime, "scripts");
        fs.readdir(scriptPath, (err, files) => {
            if (err) return done(err);
            files.forEach(file => copy(path.join(scriptPath, file), path.join(destinationPath, "scripts", file)));
        });

        /* Create package.json for project */
        const pkg = createPackageJSON(app_name);
        write(path.join(destinationPath,"package.json"), JSON.stringify(pkg, null, 2));
        done();
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
        scripts: {
            start: "TODO: SOME WATCH COMMAND",
            build: "node ./scripts/build",
            deploy: "node ./scripts/deploy"
        },
        devDependencies: {
            "serialport": "^4.0.0"
        },
        engines: {
        
        }
    };

    pkg.engines[argv.runtime] = RUNTIMES[argv.runtime];

    return pkg;
}

createApplicaiton(argv.path);
