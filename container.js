'use strict';

module.exports = Container;

var $private = require('private').createAccessor();

function addDefaults(container) {
  var defs = $private(container).defs;

  container

  .define(null, 'ioc', 'singleton', [], function () {
    return {
      get: function (serviceName) {
        var def = defs[serviceName];
        if (!def) throw new Error('Unknown dependency: "' + serviceName + '".');
        return instantiate(def);
      }
    };
  });

}

function Container() {

  // Definitions and module state information:
  $private(this).defs = {};

  // Module export with getters attached:
  $private(this).mod  = {};

  // Add default services (injection helpers, etc.)
  addDefaults(this);
}

function instantiate(def) {

  if (def.instance) {
    // Return singleton instance:
    return def.instance;
  }

  // Need to instantiate a new instance:

  // Instantiate dependencies:
  var deps = def.defs.map(instantiate);
  var obj = {};

  // Call factory method. Applying to `obj` means the factory can export to `this`.
  obj = def.getter.apply(obj, deps) || obj;

  // Only need to store instance when it is a singleton:
  if (def.type === 'singleton') {
    def.instance = obj;
    delete def.getter;
  }

  return obj;

}

/**
 * Add a definition to a container.
 * @param  {[String]} namespace  Path on exported object. If null, the definition will not be exported.
 * @param  {String} name         The name for dependency injection, and, if applicable, exporting.
 * @param  {String} type         (singleton|transient)
 * @param  {[String]} injects    Names of dependencies.
 * @param  {Function} getter     Factory method which takes dependencies in order of injects variable.
 * @return {Container}
 */
Container.prototype.define = function (namespace, name, type, injects, getter) {
  var defs = $private(this).defs;
  var def = {
    namespace: namespace,
    name     : name,
    type     : type,
    getter   : getter,
    defs     : injects.map(function (inject) {
      var dep = defs[inject];
      if (!dep) {
        var serviceName = namespace.length ? (namespace.join('.') + '.' + name) : name;
        throw new Error('Service "' + serviceName + '" needs dependency "' + inject + '" which is not yet defined.');
      }
      return dep;
    })
  };

  defs[name] = def;
  
  // Export to module:
  if (namespace) {
    var parent = $private(this).mod;
    namespace.forEach(function (n) {
      parent = parent[n] || (parent[n] = {});
    });
    Object.defineProperty(parent, name, {
      enumerable: true,
      get: function () {
        return instantiate(def);
      }
    });
  }
  
  return this;
};

/**
 * Return exported object
 * @return {Object}
 */
Container.prototype.export = function () {
  return $private(this).mod;
};
