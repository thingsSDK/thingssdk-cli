'use strict';
const env = process.argv[2];

if(!env) throw Error('Environment not present. Please use development or production.');

const path = require('path');
const deployer = require('thingssdk-deployer')();

const espruinoStrategy = require('thingssdk-espruino-strategy');

const iotPackageJson = require('../package.json');
const devices = require('../devices.json').devices;
const scriptsDir = path.dirname(require.main.filename);
const payload = {
    entry: path.join(__dirname, '..', iotPackageJson.main),
    buildDir: path.join(scriptsDir, '..', 'build'),
    env
};

deployer.prepare(devices, payload);

deployer.use('espruino', espruinoStrategy.build);
deployer.use('espruino', espruinoStrategy.upload);

deployer.deploy();