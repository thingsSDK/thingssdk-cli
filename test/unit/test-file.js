'use strict';

const expect = require("chai").expect;
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");

const {isDirectoryEmpty} = require("../../lib/core/file");

describe("function isDirectoryEmpty()", () => {
    it("should throw an error if given no path", (done) => {
        isDirectoryEmpty().catch(err => {
          expect(err).to.be.a('Error');
          done();
        });
        
    });

    it("should return false if any files are present in the given directory", (done) => {
        /**
          An arbitrary directory that we know isn't empty
        */
        const thisDirectory = path.resolve(__dirname);

        /**
          Initialize actual here so that we can update it with
          the async results of isDirectoryEmpty
        */
        let actual;
        const expected = false;

        /**
          asyncResult is passed to the callback via
          isDirectoryEmpty internal logic
        */
        const callback = (asyncResult) => {
            actual = asyncResult;
            expect(actual).to.equal(expected);
            done();
        };

        isDirectoryEmpty(thisDirectory).then(callback);
    });

    it("should return true if the given directory is empty", (done) => {
        const emptyDirectory = path.resolve(__dirname, "empty");
        mkdirp(emptyDirectory);

        /**
          Initialize actual here so that we can update it with
          the async results of isDirectoryEmpty
        */
        let actual;
        const expected = true;

        /**
          isDirectoryEmpty internal logic
          asyncResult is passed to the callback via
        */
        const callback = (asyncResult) => {
            actual = asyncResult;
            expect(actual).to.equal(expected);

            /**
              Destroy the empty directory we made for this test
              before we finish
            */
            fs.rmdir(emptyDirectory);
            done();
        };

        isDirectoryEmpty(emptyDirectory).then(callback);
    });
});
