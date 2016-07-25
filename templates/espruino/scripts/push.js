'use strict';
const deployer = require('thingssdk-deployer')();

const espruino = require('thingssdk-espruino');

const iotPackageJson = require('../package.json');
const devices = require('../devices.json').devices;

deployer.build('espruino', espruino.build(iotPackageJson.main));

deployer.upload('espruino', espruino.upload(devices));