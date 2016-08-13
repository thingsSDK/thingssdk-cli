'use strict';

const serialport = require("serialport");
const {printLoading} = require('./cli-helpers');

function getPorts() {
    let clearDevicePrompt;
    return new Promise(
        (resolve, reject) => {
            function portResolver(err, ports) {
                if (err) reject(err);
                const portNames = ports.map((port) => port.comName);
                if (portNames.length > 0) {
                    if (clearDevicePrompt) clearDevicePrompt();
                    resolve(portNames);
                } else {
                    clearDevicePrompt = clearDevicePrompt || printLoading("Plug your device in", ".", 3);
                    serialport.list(portResolver);
                }
            }
            serialport.list(portResolver);
        });
}

module.exports = {
    getPorts
};