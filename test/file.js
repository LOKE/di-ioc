'use strict';

var expect = require('expect');
var ioc = require('../');

describe('file handling', function () {
  describe('.singleton()', function () {
    it('should format the name correctly based on the folder name', function () {
      var app = ioc.create(require)
      .singleton('x', function () {})
      .singleton('./dir-a')
      .init();
      expect(app.x).toExist();
      expect(app.dirA).toExist();
    });
    it('should format the name correctly based on the file name', function () {
      var app = require('./dir-a/list')
      .run(ioc)
      .init();
      expect(app.example).toExist();
    });
  });
});
