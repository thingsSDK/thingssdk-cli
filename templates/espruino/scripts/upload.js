/* Upload file */
'use strict';

const build = require('./build');
const iotPackageJson = require('../package.json');

build(iotPackageJson.main, (err, code) => {
    if (err) {
        console.error(err.message);
    } else {
        //TODO: Serialport magic
        console.log(code);
    }
});