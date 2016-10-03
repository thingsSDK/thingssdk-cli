'use strict';
const path = require('path');
const deployer = require('thingssdk-deployer')();

const espruinoStrategy = require('thingssdk-espruino-strategy');

const iotPackageJson = require('../package.json');
const devices = require('../devices.json').devices;
const scriptsDir = path.dirname(require.main.filename);
const payload = {
    entry: iotPackageJson.main,
    buildDir: path.join(scriptsDir, '..', 'build')
};

deployer.prepare(devices, payload);

deployer.use('espruino', espruinoStrategy.build);
deployer.use('espruino', espruinoStrategy.upload);

deployer.deploy();