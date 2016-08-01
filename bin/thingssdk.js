#!/usr/bin/env node
'use strict';

const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const cliPackage = require("../package.json");
const exec = require("child_process").exec;
const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        } else if (!isEmpty) {
            readLine.question(`Files already exist at ${destinationPath}.
Would you like to overwrite the existing files?
Type y or n: `, (answer) => {
                switch (answer.toLowerCase().trim()) {
                    case ("y" || "yes"):
                        console.log("Answered 'yes'. Overwriting existing project files.");
                        readLine.close();
                        createFiles(destinationPath, applicationFinished(destinationPath));
                        break;
                    case ("n" || "no"):
                        console.log("No project files were changed. Aborting new project creation.");
                        readLine.close();
                        process.exit(1);
                        break;
                    default:
                        console.error("I don't understand your input. No project files were changed. Aborting new project creation.");
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
	    console.log(`To install the project dependencies:\n\tcd ${destinationPath} && npm install`);
	    console.log(`To upload to your device:\n\tcd ${destinationPath} && npm run push`);
        process.exit(0);
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

createApplication(argv.path);
