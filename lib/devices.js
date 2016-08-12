'use strict';
const serialport = require("serialport");
const inquirer = require("inquirer");
const {printLoading} = require('./core/cli');
const path = require("path");
const {write} = require('./core/file');

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

function devicesObject(port, baud_rate, runtime) {
    baud_rate = parseInt(baud_rate);
    const devices = {};
    devices[port] = {baud_rate, runtime};
    return { devices }; 
}

function askUserForPortAndBaudRate(runtime) {
    return getPorts().then((ports) => {
            let questions = [
                {
                    type: 'list',
                    name: 'port',
                    message: 'Select a port:',
                    choices: ports,
                    default: ports[0]
                },
                {
                    type: 'list',
                    name: 'baud_rate',
                    message: 'Select the baud rate:',
                    choices: ['9600', '115200'],
                    default: '115200'
                }
            ];

            let deviceJSON = inquirer.prompt(questions).then(answers => {
                const port = answers.port;
                return devicesObject(port, answers.baud_rate, runtime);
            });

            return deviceJSON;
        });
}

function createDevicesJSON(options) {
    const {port, baud_rate, runtime, destinationPath} = options;
    let devicePromise;
    
    if (typeof port === 'undefined' && typeof baud_rate === 'undefined') {
        devicePromise = askUserForPortAndBaudRate(runtime);
    } else {
        devicePromise = new Promise((resolve) => {
            resolve(devicesObject(port, baud_rate, runtime));
        });
    }
    
    return devicePromise.then(devices => {
        write(path.join(destinationPath, "devices.json"), JSON.stringify(devices, null, 2));
    });
}

module.exports = {
    createDevicesJSON
};