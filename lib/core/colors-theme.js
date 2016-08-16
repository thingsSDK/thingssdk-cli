'use strict';

const colors = require("colors");
colors.setTheme({
    info: "green",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red"
});

module.exports = colors;