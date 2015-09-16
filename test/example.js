/* eslint no-console:0 */

'use strict';

describe('example.js', function () {
  it('should not have errors', function () {
    var consoleLog = console.log;
    global.console.log = function () {};
    var err;
    try {
      require('../example');
    } catch (ex) {
      err = ex;
    }
    console.log = consoleLog;
    if (err) throw err;
  });
});
