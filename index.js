'use strict';

module.exports = Router;
module.exports.create = function () {
  return new Router();
};

var $private = require('private').createAccessor();

var Container = require('./container');

function getArguments(fn) {
  var injects = /^function *\(([^\)]*)\)/.exec(fn + '');
  if (!injects) {
    throw new Error('Could not parse function signature for injection dependencies.');
  }

  return injects[1].split(',').map(function (e) {
    return e && e.trim();
  })
  .filter(Boolean);
}

function Router() {
  $private(this).defs = [];
}

Router.prototype.define = function (name, defn, type) {
  type = type || 'singleton';
  $private(this).defs.push({name: name, defn: defn, type: type});
  return this;
};

Router.prototype.singleton = function (name, defn) {
  return this.define(name, defn, 'singleton');
};

Router.prototype.transient = function (name, defn) {
  return this.define(name, defn, 'transient');
};

function attach(router, container, namespace) {
  namespace = namespace || [];
  $private(router).defs.forEach(function (def) {
    if (typeof def.defn === 'function') {
      var fn = def.defn;
      var args = getArguments(fn);
      container.define(namespace, def.name, def.type, args, function () {
        var obj = {};
        return fn.apply(obj, arguments) || obj;
      });
    } else if (def.defn instanceof Router) {
      attach(def.defn, container, namespace.concat(def.name));
    }
  });
}

Router.prototype.init = function () {
  var container = new Container();

  // Set up container with dependency graph.
  attach(this, container, []);

  return container.export();
};
