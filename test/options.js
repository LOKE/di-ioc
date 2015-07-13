'use strict';

var expect = require('expect');
var ioc = require('../');

describe('option handling', function () {
  describe('.create()', function () {
    it('should pass arguments as services which can be injected', function () {
      var app = ioc.create()
      .singleton('example', function (input) {
        return input + 2;
      })
      .init({input: 3});
      expect(app.example).toBe(5);
    });
  });
});
