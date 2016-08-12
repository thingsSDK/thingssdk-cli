"use strict";

const {createApplication} = require('../new');
const colors = require('../core/colors.theme');

/**
 * Yargs required exports
 */

exports.command = "new <path>";

exports.describe = 'create an applicaiton at a given path';

exports.builder = {
    runtime: {
        default: "espruino"
    }
};

exports.handler = function (argv, callback) {
    createApplication(argv).then(() => {
        if (typeof callback === 'function') callback();
        else process.exit(0);
    }).catch(err => {
        console.error(colors.error(err));
        if (typeof callback === 'function') callback(err);
        else process.exit(1);
    });
};