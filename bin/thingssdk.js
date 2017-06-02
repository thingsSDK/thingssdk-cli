#!/usr/bin/env node
'use strict';

const cliPackage = require("../package.json");

const argv = require("yargs")
                .version(cliPackage.version)
                .commandDir('../lib/commands')
                .option("runtime", {
                    alias: "r",
                    describe: "Runtime for the device",
                })
                .option("baud_rate", {
                    alias: "b",
                    describe: "Baud rate for the device"
                })
                .option("port", {
                    alias: "p",
                    describe: "Serial port for the device"
                })
                .demand(1)
                .strict()
                .help()
                .argv;
