/*
 * Unit Tests
 *
 */


// Dependencies
const helpers = require('./../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('../lib/exampleDebuggingProblem');

// Holder for the tests
const unit = {};

// Assert that getANumber function is returning a number
unit['helpers.getANumber should return a number'] = (done) => {
  const val = helpers.getANumber();
  assert.equal(typeof(val),'number');
  done();
};

// Assert that getANumber function is returning a 1
unit['helpers.getANumber should return 1'] = (done) => {
  const val = helpers.getANumber();
  assert.equal(val,1);
  done();
};

// Assert that getANumber function is returning a 2
unit['helpers.getANumber should return 2'] = (done) => {
  const val = helpers.getANumber();
  assert.equal(val,2);
  done();
};

// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = (done) => {
  logs.list(true, (err, logFileNames) => {
    assert.equal(err, false);
    assert.ok(logFileNames instanceof Array);
    assert.ok(logFileNames.length > 1);
    done();
  });
};

// logs.truncate should not throw even if the logId does not exist
unit['logs.truncate should not throw if the logId does not exist. It should call error instead'] = (done) => {
  assert.doesNotThrow(() => {
    logs.truncate('I do not exist', err => {
      assert.ok(err);
      done();
    })
  }, TypeError);
};

// exampleDebuggingProblem should not throw, but it does
unit['exampleDebuggingProblem.init should not throw when called'] = (done) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init();
    done();
  }, TypeError);
};

// Export the tests to the runner
module.exports = unit;
