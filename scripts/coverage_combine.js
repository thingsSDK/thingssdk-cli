'use strict';

const fs = require('fs');
const path = require('path');

const istanbul = require('istanbul'),
    collector = new istanbul.Collector(),
    reporter = new istanbul.Reporter(),
    sync = false;

const coveragePath = "./coverage";

fs.readdir(coveragePath, (err, files) => {
    files
        .filter(file => path.extname(file) === ".json")
        .map(file => path.join(coveragePath, file))
        .map(filePath => fs.readFileSync(filePath, "utf-8"))
        .map(fileContents => JSON.parse(fileContents))
        .forEach(json => collector.add(json));
    reporter.addAll(['lcov']);
    reporter.write(collector, sync, function () {
        console.log('All reports generated');
    });
});