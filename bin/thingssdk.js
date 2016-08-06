#!/usr/bin/env node
'use strict';

const cliPackage = require("../package.json");

const argv = require("yargs")
                .version(cliPackage.version)
                .command(require("./commands/new"))
                .demand(1)
                .help()
                .argv;
