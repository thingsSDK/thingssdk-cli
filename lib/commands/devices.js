'use strict';

const createDevicesForJSON = require('../devices').createDevicesForJSON;
const path = require("path");
const {write} = require('../file');
const colors = require('../colors.theme');

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
    createDevicesForJSON(argv.port, argv.baud_rate, argv.runtime).then(devices => {
        write(path.join(process.cwd(), "devices.json"), JSON.stringify(devices, null, 2));
    }).then(() => {
        console.log(colors.info("devices.json successfully created"));
        if(typeof callback === 'function') callback();
        else process.exit(0);
    }).catch(err => {
        console.error(colors.error(err));
        process.exit(1);
    });
};