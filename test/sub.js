'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.use()', function () {
  it('should mount instance', function () {
    var a = ioc.create();
    var b = ioc.create();
    a.use('b', b);
    const container = a.init();
    expect(typeof container.b).toEqual('object');
  });

  it('should be able to mount the same instance twice', function () {
    var a = ioc.create();
    var b = ioc.create();
    a.use('b', b);
    a.use('c', b);
    var app = a.init();
    expect(typeof app.b).toEqual('object');
    expect(typeof app.c).toEqual('object');
    expect(app.c).toNotBe(app.b);
  });
});
