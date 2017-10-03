'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.update()', () => {
  it('should allow updating lifecycle', () => {
    let i = 0;
    const router1 = ioc.create()
    .singleton('test', () => ({value: i++}));

    const router2 = router1.clone();
    router2.update('test', { type: 'transient' });

    const app1 = router1.init();
    const app2 = router2.init();

    expect(app1.test).toEqual({value: 0});
    expect(app1.test).toEqual({value: 0});
    expect(app2.test).toEqual({value: 1});
    expect(app2.test).toEqual({value: 2});
  });
});
