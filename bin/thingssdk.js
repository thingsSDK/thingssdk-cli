#!/usr/bin/env node
'use strict';

const cliPackage = require("../package.json");

const argv = require("yargs")
                .version(cliPackage.version)
                .commandDir('commands')
                .demand(1)
                .strict()
                .help()
                .argv;
