'use strict';
const serialport = require("serialport");
const inquirer = require("inquirer");

function clearLine() {
    const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
    const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
    process.stdout.write(MOVE_LEFT + CLEAR_LINE);
    process.stdout.write("");
}

function printLoading(message, loadingChar, count) {
    let i = 0;
    let interval = setInterval(() => {
        if (i === 0) {
            process.stdout.write(message);
        }
        process.stdout.write(loadingChar);
        if (i > count) {
            clearLine();
            process.stdout.write(message);
            i = 0;
        }
        i++;
    }, 400);
    return () => {
        clearInterval(interval);
        clearLine();
    };
}


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

function createDevicesForJSON(port, baud_rate, runtime) {
    if (typeof port === 'undefined' && typeof baud_rate === 'undefined') {
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
    } else {
        return new Promise((resolve) => {
            resolve(devicesObject(port, baud_rate, runtime));
        });
    }
}

module.exports.createDevicesForJSON = createDevicesForJSON;