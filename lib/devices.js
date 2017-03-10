'use strict';
const inquirer = require("inquirer");
const path = require("path");
const {write} = require('./core/file');
const {getPorts} = require('./core/ports');

/**
 * @name devicesObject
 *
 * @description
 * Helper function ran to ask user for Port
 *
 * @param {String} port
 * @param {String} baud_rate
 * @param {String} runtime The proper key for runtime + version
 *
 * @returns {object} device configuration object
 *
 * @example
 * ```js
 *  {
 *    "devices": {
 *      "/dev/cu.SLAB_USBtoUART": {
 *        "baud_rate": 115200,
 *        "runtime": "espruino"
 *      }
 *    }
 *  }
 * ```
 */
function devicesObject(port, baud_rate, runtime) {
    baud_rate = parseInt(baud_rate);
    const devices = {};
    devices[port] = { baud_rate, runtime };
    return { devices };
}

/**
 * @name askForPort
 * @requires getPorts
 *
 * @description
 * Helper function ran to ask user for Port
 *
 * @param {object} answers partial device configuration object
 *
 * @returns {object} partial device configuration object with port property
 *    defined.
 */
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

/**
 * @name askForBaudRate
 *
 * @description
 * Helper function ran to ask user for baud rate
 *
 * @param {object} answers partial device configuration object
 *
 * @returns {object} partial device configuration object with baud_rate property
 *    defined.
 */
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

/**
 * @name askUserForPortAndBaudRate
 *
 * @description
 * Helper function ran to ask user for both port and baud rate, then
 * return the devices configuration object.
 *
 * @param {String} runtime The proper key for runtime + version
 *
 * @returns {object} complete device configuration object
 */
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

/**
 * @name createDevicesJSON
 * @requires askUserForPortAndBaudRate
 * @requires askForPort
 * @requires askForBaudRate
 * @requires devicesObject
 * @requires write
 *
 * @description
 * Asks the user for any unspecified configuration details, then
 * writes the configuration to the devices.json file in the IoT project
 *
 * @param {Object} options The four configuration options passed to the yargs
 *    command line.
 *
 * ```js  options = {
 *          port,
 *          baud_rate,
 *          path,
 *          runtime
 *        }
 * ```
 */
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
