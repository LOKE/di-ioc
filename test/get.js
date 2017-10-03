'use strict';

var expect = require('expect');
var ioc = require('../');

describe('.get()', () => {
  it('should get nested', () => {
    const subRouter = ioc.create()
    .singleton('b', () => ({ value: 123 }));

    const rootRouter = ioc.create()
    .use('a', subRouter);

    expect(rootRouter.get('a.b').name).toEqual('b');
  });
});
