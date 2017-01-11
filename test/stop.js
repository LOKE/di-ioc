'use strict';

var expect = require('expect');
var ioc = require('../');
var P = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

describe('.stop()', function () {
  it('should call stop on all active instances', function (done) {
    var stopA = 0;
    var app = ioc.create()
    .singleton('a', function () {
      return {stop: function () {
        stopA++;
        return P.resolve();
      }};
    })
    .singleton('b', function () {
      return {stop: function () {
        throw new Error('No need to since it was never started.');
      }};
    })
    .init();
    expect(app.a).toExist();
    app.stop()
    .then(function () {
      expect(stopA).toBe(1);
      done();
    })
    .then(null, done);
  });
  it('should be able to mount the same instance twice', function () {
    var a = ioc.create();
    var b = ioc.create();
    a.use('b', b);
    a.use('c', b);
    var app = a.init();
    expect(app.b).toEqual({});
    expect(app.c).toEqual({});
    expect(app.c).toNotBe(app.b);
  });
});
