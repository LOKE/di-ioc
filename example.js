'use strict';

var ioc = require('./');

// Utility submodule
var util = ioc.create()
.define('random', function () {
  var pseudoRandomBytes = require('crypto').pseudoRandomBytes;
  return {
    base64: function () {
      return pseudoRandomBytes(20).toString('base64');
    }
  };
});


// Application submodule
var app = ioc.create()
.define('greet', function (random) {
  return function (name) {
    console.log('Hello ' + name + '! Here is a random string: ' + random.base64());
  };
});

// Module export:
module.exports = ioc.create()
.define('util', util)
.define('app',  app)
.init();

// Using module:
var randomService = module.exports.util.random;

// eQ/NZnl7qusVN9hB/3nCn3wFKfY=
console.log(randomService.base64());

// Hello World! Here is a random string: dfLGC20CpCJxAZSu+uFp57dlJl0=
module.exports.app.greet('World');
