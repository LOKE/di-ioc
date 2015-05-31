# di-ioc

Dependency injection.

## Example

### util/index.js

```js
module.exports = require('di-ioc').create()

.define('random', function () {
  var pseudoRandomBytes = require('crypto').pseudoRandomBytes;
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

// Greeting service which uses the random service:
.define('greet', function (random) {
  return function (name) {
    console.log('Hello ' + name + '! Here is a random string: ' + random.base64());
  };
});

```


### index.js

```js
module.exports = require('di-ioc').create()
.define('util', require('./util'))
.define('app',  require('./app'))

.init();

var randomService = module.exports.util.random;

// eQ/NZnl7qusVN9hB/3nCn3wFKfY=
console.log(randomService.base64());

// Hello undefined! Here is a random string: dfLGC20CpCJxAZSu+uFp57dlJl0=
module.exports.app.greet();


```
