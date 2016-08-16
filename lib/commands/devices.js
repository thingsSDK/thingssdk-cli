'use strict';

const {createDevicesJSON} = require('../devices');
const colors = require('../core/colors-theme');
const {onError} = require('../core/cli-helpers');

/**
 * Yargs required exports
 */

exports.command = "devices";

exports.describe = 'create a devices.json in current directory';

exports.builder = {
    runtime: {
        default: "espruino"
    }
};

exports.handler = function(argv)  {
    const {port, baud_rate, runtime} = argv;
    const deviceJSONOptions = {port, baud_rate, runtime, destinationPath: process.cwd() };
    createDevicesJSON(deviceJSONOptions).then(() => {
        console.log(colors.info("devices.json successfully created"));
        process.exit(0);
    }).catch(onError);
};