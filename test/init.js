'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.init()', () => {
  it('should initialise dependencies', () => {
    var router = ioc.create()
    .singleton('a', () => ({ type: 'a' }))
    .singleton('b', () => ({ type: 'b' }));

    const app1 = router.init();

    expect(app1.a).toEqual({ type: 'a' });
    expect(app1.b).toEqual({ type: 'b' });
  });

  it('should create a new independent container state each call', () => {
    var router = ioc.create()
    .singleton('a', () => ({ type: 'a' }));

    const app1 = router.init();
    const app2 = router.init();

    app2.a.type = 'x';

    expect(app1.a).toEqual({ type: 'a' });
    expect(app2.a).toEqual({ type: 'x' });
  });
});
