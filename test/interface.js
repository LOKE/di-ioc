'use strict';

var expect = require('expect');
var ioc = require('../');

describe('interface', function () {
  describe('.interface()', function () {
    it('should not automatically be called', function () {
      ioc.create().interface('service', function () {
        throw new Error('Attempted to validate interface.');
      })
      .init();
    });
    it('should not require any details', function () {
      ioc.create().interface('service').init();
    });
    it('should not export an object', function () {
      var app = ioc.create().interface('service').init();
      expect(app.service).toNotExist();
    });
    it('should pass with empty validation', function () {
      var app = ioc.create()
      .interface('service')
      .singleton('service', function () { return {}; })
      .init();
      expect(app.service).toExist();
    });
    it('should pass valid instances', function () {
      var instance = {};
      var app = ioc.create()
      .interface('service', function (x) { return x === instance; })
      .singleton('service', function () { return instance; })
      .init();
      expect(app.service).toBe(instance);
    });
    it('should reject false instances', function () {
      var instance = {};
      var app = ioc.create()
      .interface('x', function () { return false; })
      .singleton('x', function () { return instance; })
      .init();
      expect(function () { return app.x; }).toThrow(/failed to validate against interface x/);
    });
    it('should reject false instances with error messages', function () {
      var instance = {};
      var app = ioc.create()
      .interface('service', function () { throw new Error('THIS IS A TEST'); })
      .singleton('service', function () { return instance; })
      .init();
      expect(function () { return app.service; }).toThrow(/THIS IS A TEST/);
    });
  });
  describe('.singleton()', function () {
    it('should fail when something depends on an interface with no implementation', function () {
      var app = ioc.create()
      .interface('x')
      .singleton('y', function (x) { return x; });
      expect(function () { return app.init().y; }).toThrow(/Interface x has no implementation, but is required by y/);
    });
  });
});
