'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');


describe("function getPorts()", () => {
    let getPorts;
    let error;
    let ports;
    before(() => {
        getPorts = proxyquire('../../lib/core/ports', {
            'serialport': {
                list: (callback) => {
                    callback(error, ports);
                }
            }
        }).getPorts;
    });

    it("should return a list of serveral ports", done => {
        error = null;
        ports = [{ comName: "COM3" }, { comName: "COM7" }]
        getPorts().then(ports => {
            assert.deepEqual(ports, ["COM3", "COM7"]);
            done();
        }).catch(err => {
            assert.isNull(err);
            done();
        });
    });

    it("should return a list of port if there's only one port", done => {
        error = null;
        ports = [{ comName: "COM7" }];
        getPorts().then(ports => {
            assert.deepEqual(ports, ["COM7"]);
            done();
        }).catch(err => {
            assert.isNull(err);
            done();
        });
    });

    it("should return an error", done => {
        const errorMessage = "Opps some serial port error";
        error = new Error(errorMessage);
        ports = null;
        getPorts().then(ports => {
            assert.isNull(ports);
            done();
        }).catch(err => {
            assert.equal(err.message, errorMessage);
            done();
        });
    });

    it("should eventually return ports once they're plugged in", done => {
        //Initially there's no ports [], then COM7 get's plugged in
        const calls = [[], [{ comName: "COM7" }]];
        let callBackTime = 0;
        const getPorts = proxyquire('../../lib/core/ports', {
            'serialport': {
                list: (callback) => {
                    const ports = calls.shift();
                    setTimeout(() => callback(null, ports), callBackTime+=1200);
                }
            }
        }).getPorts;

        getPorts().then(ports => {
            assert.deepEqual(ports, ["COM7"], 'Ports were not what was expected');
            done();
        }).catch(err => {
            assert.isNull(err);
            done();
        });
    }).timeout(4000);

});