"use strict";

exports.command = "new <path>";
 
exports.describe = 'create an applicaiton at a given path';
 
exports.builder = {
    runtime: {
        default: "espruino"
    }
};
 
exports.handler = function (argv) {

};