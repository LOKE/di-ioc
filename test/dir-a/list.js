'use strict';

exports.run = function (ioc) {
  return ioc.create(require)
  .singleton('./example.js');
};
