'use strict';

const path = require('path');
const rmdir = require('rimraf');

function prepCommand(command, cliArgs, path_to = "") {
    cliArgs[0] = path_to + cliArgs[0];
    if (process.env.running_under_istanbul) {
        let cmd = "istanbul";
        if (process.platform === 'win32') cmd = `${cmd}.cmd`;
        cliArgs.unshift(cliArgs[0]);
        cliArgs[1] = "--";
        cliArgs = ['cover', '--report=none', '--print=none', '--include-pid'].concat(cliArgs);
        command = path.join(path_to, "node_modules", ".bin", cmd);
    }
    return { command, cliArgs };
}

function cleanTmp(done) {
    rmdir('tmp', function (error) {
        done();
    });
}

module.exports = {
    prepCommand,
    cleanTmp
};