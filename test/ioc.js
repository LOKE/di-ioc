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
  it('should have an .inject() method', function () {
    var app = IOC.create()
    .singleton('b', function () {
      return 3;
    })
    .singleton('a', function (ioc) {
      return ioc.inject(function (b, c) { return b + c; }, {c: 2});
    })
    .init();
    expect(app.a).toBe(3 + 2);
  });
  it('should throw an error when dependencies are missing', function () {
    var app = IOC.create()
    .singleton('a', function (ioc) {
      return ioc.inject(function (c) { return c; });
    })
    .init();
    expect(function () {
      return app.a;
    }).toThrow(/Missing dependency: c/);
  });
});
