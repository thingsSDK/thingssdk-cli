'use strict';

const assert = require('chai').assert;
const mkdirp = require('mkdirp');
const {createApplication: newCommand} = require("../../lib/new");
const fs = require('fs');
const path = require('path');
const suppose = require("suppose");
const {prepCommand, cleanTmp} = require('./helper');

describe("thingssdk new", () => {
    const projectPath = "tmp/folder/to/project_name";

    const validArguments = {
        port: "COM7",
        baud_rate: "115200",
        runtime: "espruino",
        path: projectPath
    };

    describe("with valid arguments", () => {
        before(cleanTmp);

        it("should create a devices.json", done => {
            newCommand(validArguments).then(() => {
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
            const pkgJSON = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json")));
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
            assert.deepEqual(pkgJSON, expectedJson, "package.json didn't match expectedJson");
            done();
        });

        it("should copy the correct files", done => {
            const templatesPath = path.join(__dirname, "..", "..", "templates");
            const files = [
                {
                    source: path.join(templatesPath, "dot-gitignore"),
                    dest: path.join(projectPath, ".gitignore")
                },
                {
                    source: path.join(templatesPath, "main.js"),
                    dest: path.join(projectPath, "main.js")
                },
                {
                    source: path.join(templatesPath, validArguments.runtime, "scripts", "push.js"),
                    dest: path.join(projectPath, "scripts", "push.js")
                },

            ];
            files.forEach(file => {
                const fileSourceContents = fs.readFileSync(file.source, "utf-8");
                const fileDestinationContents = fs.readFileSync(file.dest, "utf-8");
                assert.equal(fileSourceContents, fileDestinationContents, `file contetnts for ${file.dest} didn't match ${file.source}`);
            });
            done();
        });

    });

    describe("when folder already exists", () => {
        const mainPath = path.join(projectPath, 'main.js');
        const newFileContents = "console.log('hello world')";
        let command = "node";
        let cliArgs = [`bin/thingssdk.js`, `new`, projectPath, `--port=${validArguments.port}`, `--baud_rate=${validArguments.baud_rate}`];

        before(done => {
            const preparedCommand = prepCommand(command, cliArgs);
            command = preparedCommand.command;
            cliArgs = preparedCommand.cliArgs;
            done();
        });

        beforeEach(done => {
            cleanTmp(() => {
                newCommand(validArguments).then(() => {
                    fs.writeFileSync(mainPath, newFileContents);
                    done();
                });
            });
        });

        it("should replace files if y", done => {
            assert.equal(fs.readFileSync(mainPath, "utf-8"), newFileContents);
            suppose(command, cliArgs)
                .when('Type y or n: ').respond('y\n')
                .on('error', function (err) {
                    console.log(err.message);
                })
                .end(function (code) {
                    assert.equal(code, 0, "process exit code");
                    assert.notEqual(fs.readFileSync(mainPath, "utf-8"), newFileContents);
                    done();
                });
        }).timeout(5000);

        it("should abort if n", done => {
            assert.equal(fs.readFileSync(mainPath, "utf-8"), newFileContents);
            suppose(command, cliArgs)
                .when('Type y or n: ').respond('n\n')
                .on('error', function (err) {
                    console.log(err.message);
                })
                .end(function (code) {
                    assert.equal(code, 0, "process exit code");
                    assert.equal(fs.readFileSync(mainPath, "utf-8"), newFileContents);
                    done();
                });
        }).timeout(5000);

        it("should abort and error if y or n not pressent", done => {
            assert.equal(fs.readFileSync(mainPath, "utf-8"), newFileContents);
            suppose(command, cliArgs)
                .when('Type y or n: ').respond('please don\'t\n')
                .on('error', function (err) {
                    console.log(err.message);
                })
                .end(function (code) {
                    assert.equal(code, 1, "process exit code");
                    assert.equal(fs.readFileSync(mainPath, "utf-8"), newFileContents);
                    done();
                });
        }).timeout(5000);
    });

    describe("if arguments with tildas in the path are passed", () => {
        it("should error if tilda is used at the start of path and no project created", done => {
            const examplePath = "~/example";
            newCommand({
                path: examplePath, 
                port: "COM7",
                baud_rate: "115200",
                runtime: "espruino"
            }).catch((err) => {
                assert.isNotNull(err);
                // package.json shouldn't be there, i.e. project not created
                assert.throws(() => fs.readFileSync(path.join(examplePath, "package.json"))); 
                done();
            });
        });

        it("should create project if it's in the middle of the path", done => {
            const examplePath = "tmp/~/example";
            newCommand({
                path: examplePath, 
                port: "COM7",
                baud_rate: "115200",
                runtime: "espruino"
            }).then(() => {
                // Check that the package.json is created i.e. project created
                const packageJSON = JSON.parse(fs.readFileSync(path.join(examplePath, "package.json")));
                assert.equal(packageJSON.name, "example"); 
                done();
            });
        });
    });

    after(cleanTmp);
});
