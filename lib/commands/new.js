"use strict";

const {createApplication} = require('../new');
const colors = require('../core/colors-theme');
const {onError, onFinish} = require('../core/cli-helpers');

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

exports.handler = function (argv) {
    createApplication(argv).then(onFinish('Project successfully created')).catch(onError);
};