'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.factory()', function () {
  it('should return undefined if it does not exist', function () {
    expect(ioc.create().factory('X')).toBe(undefined);
  });
  it('should return a wrapper function', function () {
    var factory = ioc.create()
    .interface('X', function () {})
    .singleton('X', function (a, b, c) {
      return a + b + c;
    })
    .factory('X');
    expect(factory({a: 3, b: 6, c: 8})).toBe(3 + 6 + 8);
  });
  it('should search the object hierarchy', function () {
    var App = ioc.create()
    .use('util',
      ioc.create()
      .singleton('x', Function.prototype)
    );
    expect(App.factory('x')).toBeA(Function);
  });
});
describe('.inject()', function () {
  it('should call wrapper function', function () {
    var Application = ioc.create()
    .interface('X', function () {})
    .singleton('X', function (a, b, c) {
      return a + b + c;
    });
    expect(Application.inject('X', {a: 3, b: 6, c: 8})).toBe(3 + 6 + 8);
  });
});
