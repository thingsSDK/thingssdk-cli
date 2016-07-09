'use strict';
const path = require("path");

const argv = require("yargs")
    .command(require("./commands/new"))
    .demand(2)
    .help()
    .argv;

const RUNTIMES = {
    espruino: "1.85"
};



function createApplicaiton(destinationPath) {
    const app_name = path.basename(path.resolve(destinationPath));

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

    console.log(JSON.stringify(pkg, null, 2));
}

createApplicaiton(argv.path);
