'use strict';

const assert = require('chai').assert;
const mkdirp = require('mkdirp');
const newCommand = require("../../lib/commands/new").handler;
const rmdir = require('rimraf');
const fs = require('fs');
const path = require('path');

describe("thingssdk new", () => {
    const projectPath = "tmp/folder/to/project_name";

    describe("with valid arguments", () => {
        const validArguments = {
            port: "COM7",
            baud_rate: "115200",
            runtime: "espruino",
            path: projectPath
        };

        before(done => {
            rmdir(projectPath, function (error) {
                mkdirp(projectPath, (err) => {
                    done();
                });
            });
        });

        it("should create a devices.json", done => {
            newCommand(validArguments, () => {
                const devices = JSON.parse(fs.readFileSync(path.join(projectPath, "devices.json")));
                const expectedJson = {
                    devices: {
                        COM7: {
                            runtime: "espruino",
                            baud_rate: 115200
                        }
                    }
                };
                assert.deepEqual(devices, expectedJson, "devices.json didn't match expectedJson");
                done();
            });
        });

        it("should create a properly structured package.json", done => {
            const devices = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json")));
            const expectedJson = {
                name: "project_name",
                version: '0.0.0',
                private: true,
                main: 'main.js',
                scripts: {
                    push: "node ./scripts/push"
                },
                devDependencies: {
                    //TODO: REPLACE WITH LIVE VERSIONS WHEN RELEASED @chalkers
                    "thingssdk-deployer": "github:thingssdk/thingssdk-deployer",
                    "thingssdk-espruino-strategy": "github:thingssdk/thingssdk-espruino-strategy"
                },
                engines: {
                    espruino: "1.86"
                }
            };
            assert.deepEqual(devices, expectedJson, "package.json didn't match expectedJson");
            done();
        });

        after(done => {
            rmdir(projectPath, function (error) {
                done();
            });
        });
    });
    xit("should create the correct files");
});
