'use strict';

const serialport = require("serialport");
const {printLoading} = require('./cli-helpers');

function getPorts() {
    let clearDevicePrompt;
    return new Promise(
        (resolve, reject) => {
            (function rerun() {
                serialport.list().then(ports => {
                    const portNames = ports.map(port => port.comName);
                    console.log('portNames: ', portNames)
                    if (portNames.length > 0) {
                        if(clearDevicePrompt) clearDevicePrompt();
                        resolve(portNames);
                    } else {
                        clearDevicePrompt = clearDevicePrompt || printLoading("Plug your device in", ".", 3);
                        rerun()
                    }
                }).catch(reject);
            })();
        });
}

module.exports = {
    getPorts
};