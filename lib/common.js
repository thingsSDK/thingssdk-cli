'use strict';
const fs = require("fs");

function write(path, contents) {
    fs.writeFileSync(path, contents);
}

module.exports = {
    write
};