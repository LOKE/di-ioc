# di-ioc

[![NPM Version](https://img.shields.io/npm/v/di-ioc.svg)](https://www.npmjs.com/package/di-ioc)
[![Build Status](https://img.shields.io/travis/aantthony/di-ioc/master.svg)](https://travis-ci.org/aantthony/di-ioc)
[![Coverage Status](https://img.shields.io/coveralls/aantthony/di-ioc/master.svg)](https://coveralls.io/r/aantthony/di-ioc?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/di-ioc.svg)](https://www.npmjs.com/package/di-ioc)
[![License](https://img.shields.io/npm/l/di-ioc.svg)](https://www.npmjs.com/package/di-ioc)

Dependency injection.

## Installation

`npm install --save di-ioc`

## Example

### util/index.js

```js
module.exports = require('di-ioc').create()

// Start defining a `random` service:
.define('random', function () {
  var pseudoRandomBytes = require('crypto').pseudoRandomBytes;

  // The `random` service has one function:
  return {
    base64: function () {
      return pseudoRandomBytes(20).toString('base64');
    }
  };
});
```

### app/index.js

```js
module.exports = require('di-ioc').create()

// Greeting service which uses the random service: (arguments are detected)
.define('greet', function (random) {
  return function (name) {
    console.log('Hello ' + name + '! Here is a random string: ' + random.base64());
  };
});
```


### index.js

```js
module.exports = require('di-ioc').create(require)
.use('./util')
.use('./app')

.init();

var randomService = module.exports.util.random;

// eQ/NZnl7qusVN9hB/3nCn3wFKfY=
console.log(randomService.base64());

// Hello World! Here is a random string: dfLGC20CpCJxAZSu+uFp57dlJl0=
module.exports.app.greet();
```

## Features

- Export to a standard object which automatically initialises dependencies as needed. This is the object `.init()` creates.
- Enforce that dependency graph divides into layers. For example, nothing in the 'util' submodule can depend on services in the 'app' submodule, due to the order of definition.
- Nest components in to hierarchial modules and folders.
- Instantiate one sub-tree of the hierarchy for testing.
- Instantiate objects with injected dependencies for unit testing.
- Define transient objects, using `require('di-ioc').create().transient('serviceName', ...);`.
