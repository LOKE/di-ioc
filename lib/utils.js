'use strict';

const { TYPE_INTERFACE, TYPE_SUBROUTER } = require('./types');

/**
 * Returns the instance constructed by ctor, or the return value of the function
 */
exports.applyNew = function applyNew(ctor, args) {
  var instance = Object.create(ctor.prototype || {});
  return ctor.apply(instance, args) || instance;
};

exports.ensureCanLoad = function ensureCanLoad(def, scope, siblings, prefix, path) {
  path = path || [];
  if (~path.indexOf(def.name)) {
    var serviceNames = [prefix.join('.')].concat(path.slice(1)).concat([def.name, '...']);
    throw new Error('Circular dependency: ' + serviceNames.join(' -> '));
  }

  return def.deps.every(function (name) {
    if (scope[name]) return true;
    var sibling;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i].name === name) {
        sibling = siblings[i];
        break;
      }
    }
    if (sibling) return ensureCanLoad(sibling, scope, siblings, prefix, path.concat([def.name]));
    throw new Error('Unknown dependency: ' + name + ' required by ' + prefix.join('.') + ' ' + path.join('.'));
  });
};
