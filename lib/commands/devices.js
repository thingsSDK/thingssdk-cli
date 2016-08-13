'use strict';

const {createDevicesJSON} = require('../devices');
const colors = require('../core/colors-theme');

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

exports.handler = function(argv, callback)  {
    const {port, baud_rate, runtime} = argv;
    const deviceJSONOptions = {port, baud_rate, runtime, destinationPath: process.cwd() };
    createDevicesJSON(deviceJSONOptions).then(() => {
        console.log(colors.info("devices.json successfully created"));
        if(typeof callback === 'function') callback();
        else process.exit(0);
    }).catch(err => {
        console.error(colors.error(err));
        if(typeof callback === 'function') callback(err);
        else process.exit(1);
    });
};