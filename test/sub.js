'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.use()', function () {
  it('should mount instance', function () {
    var a = ioc.create();
    var b = ioc.create();
    a.use('b', b);
    expect(a.init().b).toEqual({});
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
