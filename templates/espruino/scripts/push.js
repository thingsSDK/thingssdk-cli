'use strict';
const deployer = require('thingssdk-deployer')();

const espruinoStrategy = require('thingssdk-espruino-strategy');

const iotPackageJson = require('../package.json');
const devices = require('../devices.json').devices;
const payload = { entry: iotPackageJson.main };

deployer.prepare(devices, payload);

deployer.use('espruino', espruinoStrategy.build);
deployer.use('espruino', espruinoStrategy.upload);

deployer.deploy();