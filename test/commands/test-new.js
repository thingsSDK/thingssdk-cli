'use strict';

const expect = require("chai").expect;
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");

/**
  Destructure any functions from commands/new for unit testing
  XXX:jmf Note that the commands are pulled from (new.js).handler
*/
const {
  isDirectoryEmpty
} = require("../../lib/commands/new").testFunctions;

const createApplication = require("../../lib/commands/new").handler;

describe("thingssdk new", () => {

  describe("function isDirectoryEmpty()", () => {
    it("should throw an error if given no path", () => {
      /**
        XXX:jmf if this syntax looks weird, see:
        http://chaijs.com/api/bdd/#method_throw
      */
      const runWithoutPath = () => isDirectoryEmpty();
      expect(runWithoutPath).to.throw(Error);
    });

    it("should return false if any files are present in the given directory", (done) => {
      /**
        An arbitrary directory that we know isn"t empty
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

      isDirectoryEmpty(thisDirectory, callback);
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

      isDirectoryEmpty(emptyDirectory, callback);
    });
  });

  /**
    TODO:jmf continue unit tests.
    Remove any placeholders below that are deemed unworthy of unit testing.
  */
  xdescribe("function createApplication()", () => {
    it("should create the correct files");
    it("should create a properly structured package.json");
    it("should create a devices.json");
  });
});
