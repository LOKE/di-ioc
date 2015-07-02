'use strict';

var expect = require('expect');
var ioc = require('../');

describe('lifecycles', function () {
  describe('.singleton()', function () {
    it('should not allow multiple definitions', function () {
      var app = ioc.create()
      .singleton('x', function () {})
      .singleton('x', function () {});
      expect(function () { app.init(); }).toThrow(/re-definition of service x/i);
    });
    it('should not automatically instantiate', function () {
      ioc.create().singleton('service', function () {
        throw new Error('Attempted to instantiate.');
      });
    });
    it('should not re-instantiate', function () {
      var defined = false;
      var instance = {};
      var app = ioc.create()
      .singleton('ExampleService', function () {
        if (defined) throw new Error('Singleton is being re-instantiated!');
        defined = true;
        return instance;
      })
      .init();

      expect(app.ExampleService).toBe(instance);
      expect(app.ExampleService).toBe(instance);
      expect(app.ExampleService).toBe(instance);
    });
    it('should not share state between module instances', function () {
      var defineCount = 0;
      var app = ioc.create()
      .singleton('service', function () { defineCount++; return {}; });

      var s1 = app.init().service;
      var s2 = app.init().service;
      expect(s1).toNotBe(s2);
      expect(defineCount).toBe(2);
    });
  });

  describe('.transient()', function () {
    it('should re-instantiate', function () {
      var instance = {};
      var app = ioc.create()
      .transient('service', function () { return instance; })
      .init();

      instance = {};
      var instance1 = instance;

      expect(app.service).toBe(instance1);

      instance = {x:3};
      expect(app.service).toNotBe(instance1);
      expect(app.service).toBe(instance);
    });
    it('should be re-instantiated as a depdency', function () {
      var defineCount = 0;
      var app = ioc.create()
      .transient('service', function () { defineCount++; return {}; })
      .singleton('a', function (service) { return {service: service}; })
      .singleton('b', function (service) { return {service: service}; })
      .init();

      var a = app.a;
      var s1 = app.a.service;
      var s2 = app.b.service;
      expect(s1).toNotBe(s2);
      expect(app.a).toBe(a);
      expect(defineCount).toBe(2);
    });
    it('should not allow .stop() methods', function () {
      var service = {stop: Function.prototype};
      var app = ioc.create()
      .transient('service', function () { return service; })
      .init();
      expect(function () {
        return app.service;
      }).toThrow(/can't have a \.stop\(\) method because it is transient/);
    });
  });

});
