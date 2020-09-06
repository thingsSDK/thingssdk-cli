'use strict';

const assert = require('chai').assert;
const mkdirp = require('mkdirp');
const proxyquire = require('proxyquire');
const suppose = require("suppose");

const fs = require('fs');
const path = require('path');

const {prepCommand, cleanTmp} = require('./helper');
const {createDevicesJSON: devicesCommand} = require('../../lib/devices');


describe("thingssdk devices", () => {
  describe("with valid arguments", () => {
    const checkDevicesPath = "tmp/devices-json-check";
    const jsonPath = path.join(checkDevicesPath, "devices.json");

    const validArguments = {
      port: "COM7",
      baud_rate: "115200",
      runtime: "espruino",
      destinationPath: checkDevicesPath
    };

    const otherValidArguments = {
      port: "COM3",
      runtime: "espruino",
      baud_rate: 9600,
      destinationPath: checkDevicesPath
    };

    const validArgumentsWithoutPortAndBaudRate = {
      runtime: "espruino",
      destinationPath: checkDevicesPath
    };

    before(done => {
      cleanTmp(() => {
        mkdirp(checkDevicesPath).then(() => {done()}).catch(done);
      });
    });

    it("should create a `devices.json` in the correct folder", done => {
      mkdirp(checkDevicesPath).then(() => {
        devicesCommand(validArguments).then(() => {
          const devices = JSON.parse(fs.readFileSync(jsonPath));
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
      }).catch(done);
    });


    it("should create a `devices.json` in the correct folder with different params", done => {
      mkdirp(checkDevicesPath).then(() => {
        devicesCommand(otherValidArguments).then(() => {
          const devices = JSON.parse(fs.readFileSync(jsonPath));
          const expectedJson = {
            devices: {
              COM3: {
                runtime: "espruino",
                baud_rate: 9600
              }
            }
          };
          assert.deepEqual(devices, expectedJson, "devices.json didn't match expectedJson");
          done();
        });
      }).catch(done);
    });

    it("should exit correctly when correct aguments are passed", () => {
      process.chdir('tmp');
      let commandOutput;
      
      const {handler : cliDevicesCommand} = proxyquire('../../lib/commands/devices',
      {
        '../core/cli-helpers': {
          onFinish: (message) => {
            commandOutput = message;
          }
        }
      });

      cliDevicesCommand(validArguments);
      assert.equal(commandOutput, 'devices.json successfully created');
      process.chdir('../');
    });

    it("should ask for port and baud rate if missing from arguments", done => {
      const {createDevicesJSON: devicesCommand} = proxyquire('../../lib/devices', {
        "./core/ports": {
          getPorts: () => {
            return new Promise((resolve, reject) => {
              resolve(["COM7", "COM18"]);
            });
          }
        },
        "inquirer": {
          prompt: questions => {
            return new Promise((resolve, reject) => {
              const answers = {
                port: "COM7",
                baud_rate: 115200
              };
              resolve(answers);
            });
          }
        }
      });

      devicesCommand(validArgumentsWithoutPortAndBaudRate).then(() => {
        const devices = JSON.parse(fs.readFileSync(jsonPath));
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

    after(cleanTmp);
  });
});
