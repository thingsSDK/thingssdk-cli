'use strict';

const assert = require('chai').assert;
const mkdirp = require('mkdirp');
const newCommand = require("../../lib/commands/new").handler;
const rmdir = require('rimraf');
const fs = require('fs');

xdescribe("thingssdk new", () => {
    it("should create the correct files");
    it("should create a properly structured package.json");
    it("should create a devices.json");
});
