'use strict';

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

exports.handler =  function(argv)  {
    console.log("TODO DEVICES COMMAND");
};