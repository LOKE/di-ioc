'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.clone()', () => {
  it('should create a new router with identical definitions', () => {
    var ioc1 = ioc.create()
    .singleton('a', () => { })
    .singleton('b', () => { });

    const ioc2 = ioc1.clone();

    const app1 = ioc1.init();
    const app2 = ioc2.init();

    expect(app1.a).toExist();
    expect(app1.b).toExist();
    expect(app2.a).toExist();
    expect(app2.b).toExist();
  });

  it('should not mutate original definitions', () => {
    var ioc1 = ioc.create()
    .singleton('a', () => { })
    .singleton('b', () => { });

    const ioc2 = ioc1.clone()
    .singleton('c', () => { });

    const app1 = ioc1.init();
    const app2 = ioc2.init();

    expect(app1.c).toNotExist();
    expect(app2.c).toExist();
  });
});
