const expect = require('chai').expect
const {
  isDirectoryEmpty
} = require('../../bin/commands/new.js')

describe('isDirectoryEmpty', () => {
  it('should throw an error if given a bad path', () => {
    const runWithoutPath = () => isDirectoryEmpty()
    expect(runWithoutPath).to.throw(Error);
  })
})
