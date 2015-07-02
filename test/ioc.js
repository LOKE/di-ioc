'use strict';

var expect = require('expect');
var IOC = require('../');

describe('ioc', function () {
  it('should be provided', function () {
    var b;
    var app = IOC.create()
    .singleton('a', function (ioc) {
      return { getB: function () { return ioc.get('b'); } };
    })
    .singleton('b', function () {
      if (b) throw new Error('Already defined.');
      return b = {iAmB: true};
    })
    .init();
    expect(app.a.getB).toBeA(Function);
    expect(b).toNotExist();
    expect(app.a.getB()).toBe(b);
  });
});
