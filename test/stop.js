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
});
