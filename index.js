'use strict';

var $private = require('private').create();
var annotate = require('fn-annotate');

Router.create = module.exports = Router;

var TYPE_SINGLETON = 'singleton';
var TYPE_TRANSIENT = 'transient';
var TYPE_INTERFACE = 'interface';
var TYPE_SUBROUTER = 'use';

function Router(requireFn) {
  if (!(this instanceof Router)) return new Router(requireFn);
  $private(this).require = requireFn;
  $private(this).defs = [];
}

function set(router, type, path, factory) {
  if (type !== TYPE_INTERFACE) factory = factory || $private(router).require(path);
  var deps = typeof factory === 'function' && annotate(factory) || [];
  var name = path.replace('./', '').replace(/\.js$/, '').replace(/-(.)/g, function (s, first) {
    return first.toUpperCase();
  });

  $private(router).defs.push({name: name, type: type, factory: factory, deps: deps});
}

[TYPE_SINGLETON, TYPE_TRANSIENT, TYPE_INTERFACE, TYPE_SUBROUTER]
.forEach(function (type) {
  Router.prototype[type] = function (path, fn) { set(this, type, path, fn); return this; };
});

function Interface(def) {
  this.validate = def.factory;
}

Router.prototype.build = function (getters) {
  var instance = {};
  $private(this).defs.forEach(function (def) {
    if (def.type === TYPE_SUBROUTER) return instance[def.name] = def.factory.build(getters);
    if (def.type === TYPE_INTERFACE) return  getters[def.name] = new Interface(def);

    def.deps.forEach(function (name) {
      if (!getters[name]) throw new Error('Unknown dependency: ' + name + ' required by ' + def.name); }
    );

    var existing = getters[def.name];
    if (existing && !existing instanceof Interface) {
      throw new Error('Re-definition of service: ' + def.name);
    }

    var validate = existing && existing.validate;

    var sharedInstance;
    var get = getters[def.name] = function () {
      if (sharedInstance) return sharedInstance;

      var args = def.deps.map(function (name) { return getters[name](); });

      var newInstance = {};
      newInstance = def.factory.apply(newInstance, args) || newInstance;

      if (def.type === TYPE_SINGLETON) {
        sharedInstance = newInstance;
      }

      if (newInstance.stop) {
        if (def.type === TYPE_TRANSIENT) {
          throw new Error('Service "' + def.name + '" can\'t have a .stop() method because it is transient.');
        }
        $private(getters).active.push(sharedInstance);
      }

      if (validate) validate(newInstance);
      return newInstance;
    };

    Object.defineProperty(instance, def.name, { enumerable : true, get: get});
  });
  return instance;
};

Router.prototype.init = function () {
  var active = [];
  var state = {};
  $private(state).active = active;

  state.ioc = function () {
    return { get: function (name) { return state[name](); } };
  };

  var instance = this.build(state);
  instance.stop = function () {
    var results = active.map(function (singletonService) {
      if (singletonService.stop) return singletonService.stop();
    }).filter(Boolean);

    active.splice(0, active.length);
    return Promise.all(results);
  };
  return instance;
};

function deepSearch(router, name) {
  var defs = $private(router).defs;
  for(var i = 0; i < defs.length; i++) {
    var def = defs[i];
    if (def.type === TYPE_INTERFACE) continue;
    if (def.name === name) return def;
    if (def.type === TYPE_SUBROUTER) {
      var subresult = deepSearch(def.factory, name);
      if (subresult) return subresult;
    }
  }
}

// Methods for testing:
Router.prototype.factory = function (name) {
  var def = deepSearch(this, name);
  return def && function (services) {
    var args = def.deps.map(function (dep) {
      return services[dep];
    });
    var newInstance = {};
    return def.factory.apply(newInstance, args) || newInstance;
  };
};

Router.prototype.inject = function (name, services) {
  return this.factory(name)(services);
};

// Backwards compatibility alias:
Router.prototype.define = function (name, defn) {
  if (defn instanceof Router) return this.use(name, defn);
  return this.singleton(name, defn);
};
