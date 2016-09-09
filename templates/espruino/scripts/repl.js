const espruinoStrategy = require('thingssdk-espruino-strategy');

const devices = require('../devices.json').devices;

espruinoStrategy.utils.filterDevices(devices)
    .forEach(espruinoStrategy.repl);
