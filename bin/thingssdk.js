#!/usr/bin/env node
'use strict';

const cliPackage = require("../package.json");

const argv = require("yargs")
                .version(cliPackage.version)
                .commandDir('commands')
                .option("baud_rate", {
                    alias: "b",
                    describe: "Baud rate for the device"
                })
                .option("port", {
                    alias: "p",
                    describe: "Port for the device"
                })
                .demand(1)
                .strict()
                .help()
                .argv;
