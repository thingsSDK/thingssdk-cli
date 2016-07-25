'use strict';
const deployer = require('thingssdk-deployer')();

const espruinoStartegy = require('thingssdk-espruino-strategy');

const iotPackageJson = require('../package.json');
const devices = require('../devices.json').devices;

deployer.build('espruino', espruinoStartegy.build(iotPackageJson.main));

deployer.upload('espruino', espruinoStartegy.upload(devices));