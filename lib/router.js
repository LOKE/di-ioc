'use strict';

const annotate = require('fn-annotate');

const { Interface } = require('./interface');
const { applyNew, ensureCanLoad } = require('./utils');
const { TYPE_SINGLETON, TYPE_TRANSIENT, TYPE_INTERFACE, TYPE_SUBROUTER } = require('./types');

/**
 * Dependency router
 * @class Router
 */
class Router {
  /**
   * Creates a new Router
   * @param {NodeJsModule|RequireFn} module
   * @memberof Router
   */
  constructor(module) {
    var requireFn;

    // check if the param is a nodejs module, or a require function
    if (module && module.require) {
      requireFn = module.require.bind(module);
    } else if (typeof module === 'function') {
      // legacy:
      requireFn = module;
    }

    // require is used to ensure paths remain relative to the original module
    this._require = requireFn || null;

    // service and interface definitions
    this._defs = [];
  }

  /**
   * Alias for #init()
   * @param {any} options
   * @returns
   * @memberof Router
   */
  create(options) {
    return this.init(options);
  }

  /**
   * Initialises and creates a new DI container from this router
   * @param {any} options
   * @returns
   * @memberof Router
   */
  init(options) {
    // still not sure what active is ??
    const active = [];

    /**
     * container state (instances)
     * @type {Dict<any>}
     */
    const state = {};

    if (options) {
      Object.keys(options).forEach((key) => {
        const value = options[key];
        const getter = state[key] = function () { return value; };

        getter.longName = '<parameter: ' + key + '>';
      });
    }
    state._active = active;

    state.ioc = () => {
      return {
        /**
         * Gets the container instance for `name`
         */
        get(name) {
          return state[name]();
        },
        /**
         * Inject the function `defn` using this container.
         * Anything defined in local will override the dependency.
         * NOTE: local will only override for `defn`.
         * Dependencies further down the line will still have the originally defined dependencies.
         * @param {any} defn
         * @param {any} local
         * @returns
         */
        inject(defn, local) {
          local = local || {};
          var args = annotate(defn).map((name) => {
            if (local[name] !== undefined) return local[name];

            if (state[name]) return state[name](local);

            throw new Error('Missing dependency: ' + name);
          });
          var newInstance = {};
          return defn.apply(newInstance, args) || newInstance;
        }
      };
    };

    const instance = this._build(state, []);

    instance.stop = () => {
      // fetch app services that implement a #stop() method
      const results = active.map(singletonService => {
        if (singletonService.stop) return singletonService.stop();
      }).filter(Boolean);

      // why??
      active.splice(0, active.length);

      // execute all the stop methods at once
      // TODO: this should be smarter!
      return Promise.all(results);
    };

    return instance;
  }

  /**
   * Builds the container
   * @private
   * @param {any} getters - WHAT IS THIS??
   * @param {any} prefix when subrouters are involved, service names are prefixed
   * @returns
   */
  _build(getters, prefix) {
    var container = {};

    const defs = this._defs;
    defs.forEach((def) => {
      var longName = prefix.concat([def.name]);

      if (def.type === TYPE_SUBROUTER) {
        const subrouter = def.factory;
        return container[def.name] = subrouter._build(getters, longName);
      }

      if (def.type === TYPE_INTERFACE) {
        return getters[def.name] = new Interface(def, longName);
      }

      ensureCanLoad(def, getters, defs, longName);

      var existing = getters[def.name];
      if (existing && !(existing instanceof Interface)) {
        throw new Error('Re-definition of service ' + existing.longName.join('.') + ': ' + longName.join('.'));
      }

      var validate = existing && existing.validate;

      var sharedInstance;
      var get = getters[def.name] = function (locals) {
        if (sharedInstance) return sharedInstance;

        var args = def.deps.map(function (name) {
          if (locals) {
            var local = locals[name];
            if (local) return local;
          }
          var getter = getters[name];
          if (getter instanceof Interface) {
            throw new Error('Interface ' + getter.longName.join('.') + ' has no implementation, but is required by ' + longName.join('.'));
          }
          return getter(locals);
        });

        var newInstance = applyNew(def.factory, args);

        if (def.type === TYPE_SINGLETON) {
          sharedInstance = newInstance;
        }

        if (newInstance.stop) {
          if (def.type === TYPE_TRANSIENT) {
            throw new Error('Service "' + longName.join('.') + '" can\'t have a .stop() method because it is transient.');
          }
          getters._active.push(sharedInstance);
        }

        if (validate) {
          if (existing.validate(newInstance) === false) {
            throw new Error('Service "' + longName.join('.') + '" failed to validate against interface ' + existing.longName.join('.') + '.');
          }
        }
        return newInstance;
      };

      get.longName = longName;

      Object.defineProperty(container, def.name, { enumerable : true, get: get});
    });
    return container;
  }

  singleton(path, fn) {
    return this.set('singleton', path, fn);
  }

  transient(path, fn) {
    return this.set('transient', path, fn);
  }

  interface(path, fn) {
    return this.set('interface', path, fn);
  }

  use(path, fn) { // Subrouter
    return this.set('use', path, fn);
  }

  /**
   * What is the purpose of this?
   */
  define(name, defn) {
    if (defn instanceof Router) return this.use(name, defn);
    return this.singleton(name, defn);
  }

  /**
   * Shorthand to create a new singleton dependency that is always the provided value
   */
  constant(name, value) {
    return this.singleton(name, function () {
      return value;
    });
  }

  /**
   * Defines a new service with dependencies
   * @param {String} type singleton, transient, etc
   * @param {String} path the path OR name of this dependency. If name then factory must be provided. If path then name will be automatically contructed.
   * @param {Function} [factory] the factory function for this dependency. If not provided then will be required as a relative require from factory.
   */
  set(type, path, factory) {
    if (type !== TYPE_INTERFACE) {
      // What is this for?
      factory = factory || this._require(path);
    }

    if (factory instanceof Router) {
      type = TYPE_SUBROUTER;
    }

    // Extract dependencies for this factory based on the parameter names
    var deps = (typeof factory === 'function')
      ? annotate(factory)
      : [];

    // constructed name is stripped of invalid chars, and camelCased
    var name = path.replace('./', '').replace(/\.js$/, '').replace(/-(.)/g, function (s, first) {
      return first.toUpperCase();
    });

    // Add the definition
    this._defs.push({ name: name, type: type, factory: factory, deps: deps });

    return this;
  }

  unset(name) {
    // Redefine the deps array, removing anything that matches the name.
    // Allows for dependencies to be replaced (useful for testing)
    this._defs = this._defs.filter(item => (item.name !== name || item.type === TYPE_INTERFACE));
  }

  clone() {
    const _defs = Array.from(this._defs);
    const theClone = Object.create(this);
    theClone._defs = Array.from(this._defs);
    return theClone;
  }

  // Methods for testing:
  factory(name) {
    const def = deepSearch(this, name);
    return def && function (services) {
      const args = def.deps.map(function (dep) {
        return services[dep];
      });
      const newInstance = {};
      return def.factory.apply(newInstance, args) || newInstance;
    };
  }

  inject(name, services) {
    return this.factory(name)(services);
  }

  // STATIC
  static create(module) {
    return new Router(module);
  }
}

function deepSearch(router, name) {
  const defs = router._defs;

  for(var i = 0; i < defs.length; i++) {
    var def = defs[i];
    if (def.type === TYPE_INTERFACE) continue;
    if (def.name === name) return def;
    if (def.type === TYPE_SUBROUTER) {
      var subresult = deepSearch(def.factory, name);
      if (subresult) return subresult;
    }
  }
};

exports.Router = Router;
