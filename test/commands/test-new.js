const expect = require('chai').expect
const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')

/**
  Destructure any functions from commands/new for unit testing
*/
const {
  isDirectoryEmpty
} = require('../../bin/commands/new.js')

describe('function isDirectoryEmpty()', () => {
  it('should throw an error if given no path', () => {
    const runWithoutPath = () => isDirectoryEmpty()
    expect(runWithoutPath).to.throw(Error);
  })

  it('should return false if any files are present in the given directory', (done) => {
    /**
      An arbitrary directory that we know isn't empty
    */
    const thisDirectory = path.resolve(__dirname)

    /**
      Initialize actual here so that we can update it with
      the async results of isDirectoryEmpty
    */
    let actual
    const expected = false

    /**
      asyncResult is passed to the callback via
      isDirectoryEmpty internal logic
    */
    const callback = (asyncResult) => {
      actual = asyncResult
      expect(actual).to.equal(expected)
      done()
    }

    isDirectoryEmpty(thisDirectory, callback)
  })

  it('should return true if the given directory is empty', (done) => {
    const emptyDirectory = path.resolve(__dirname, 'empty')
    mkdirp(emptyDirectory)

    /**
      Initialize actual here so that we can update it with
      the async results of isDirectoryEmpty
    */
    let actual
    const expected = true

    /**
      asyncResult is passed to the callback via
      isDirectoryEmpty internal logic
    */
    const callback = (asyncResult) => {
      actual = asyncResult
      expect(actual).to.equal(expected)

      /**
        Destroy the empty directory we made for this test
        before we finish
      */
      fs.rmdir(emptyDirectory)
      done()
    }

    isDirectoryEmpty(emptyDirectory, callback)
  })
})
