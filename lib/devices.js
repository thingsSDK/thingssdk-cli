'use strict';
const inquirer = require("inquirer");
const path = require("path");
const {write} = require('./core/file');
const {getPorts} = require('./core/ports');

function devicesObject(port, baud_rate, runtime) {
    baud_rate = parseInt(baud_rate);
    const devices = {};
    devices[port] = { baud_rate, runtime };
    return { devices };
}

function askForPort(answers) {
    return getPorts().then((ports) => {
        const portQuestion = [
            {
                type: 'list',
                name: 'port',
                message: 'Select a port:',
                choices: ports,
                default: ports[0]
            }
        ];
        return inquirer
        .prompt(portQuestion)
        .then(promptAnswers => Object.assign({},answers,promptAnswers))
    });
}

function askForBaudRate(answers) {
    const baudRateQuestion = [
        {
            type: 'list',
            name: 'baud_rate',
            message: 'Select the baud rate:',
            choices: ['9600', '115200'],
            default: '115200'
        }
    ];
    return inquirer
    .prompt(baudRateQuestion)
    .then(promptAnswers => Object.assign({},answers,promptAnswers))
}

function askUserForPortAndBaudRate(runtime) {
    const answers = {};
    return askForPort()
        .then(answers => {
            return askForBaudRate(answers);
        })
        .then(answers => {
            return devicesObject(answers.port, answers.baud_rate, runtime);
        });
}

function createDevicesJSON(options) {
    const {port, baud_rate, runtime, destinationPath} = options;
    let devicePromise;

    if (typeof port === 'undefined' && typeof baud_rate === 'undefined') {
        devicePromise = askUserForPortAndBaudRate(runtime);
    }
    else if(typeof port === 'undefined') {
        devicePromise = askForPort({}).then(answers => devicesObject(answers.port, baud_rate, runtime));
    }
    else if(typeof baud_rate === 'undefined') {
        devicePromise = askForBaudRate({}).then(answers => devicesObject(port, answers.baud_rate, runtime));
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