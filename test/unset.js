'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.unset()', () => {
  it('should allow redefining dependencies', () => {
    var router = ioc.create()
    .singleton('a', () => ({ type: 'a' }));

    router.unset('a');
    router.singleton('a', () => ({ type: 'x' }));
    const app1 = router.init();

    expect(app1.a).toEqual({ type: 'x' });
  });

  it('should not affect other containers from the same router', () => {
    var router = ioc.create()
    .singleton('a', () => ({ type: 'a' }));
    const app1 = router.init();

    router.unset('a');
    router.singleton('a', () => ({ type: 'x' }));
    const app2 = router.init();

    expect(app1.a).toEqual({ type: 'a' });
    expect(app2.a).toEqual({ type: 'x' });
  });

  it('should not affect parent containers', () => {
    const router1 = ioc.create()
    .singleton('a', () => ({ type: 'a' }));

    const router2 = router1.clone();
    router2.unset('a');
    router2.singleton('a', () => ({ type: 'x' }));

    const app1 = router1.init();
    const app2 = router2.init();

    expect(app1.a).toEqual({ type: 'a' });
    expect(app2.a).toEqual({ type: 'x' });
  });
});
