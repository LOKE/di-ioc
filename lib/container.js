class Container {
  constructor() {
    const active = [];
    Object.defineProperty(this, '_active', { enumerable: false, value: active });
  }

  // Required for backwards compat
  stop() {
    // fetch app services that implement a #stop() method
    const results = this._active
    .map(singletonService => singletonService.stop && singletonService.stop())
    .filter(Boolean);

    // why??
    this._active.splice(0, this._active.length);

    // execute all the stop methods at once
    // TODO: this should be smarter!
    return Promise.all(results);
  }

  set(name, value) {
    if (typeof value === 'function') {
      Object.defineProperty(this, name, {
        enumerable : true,
        get: value
      });
    } else {
      Object.defineProperty(this, name, {
        enumerable : true,
        value: value
      });
    }
  }

  setActive(instance) {
    this._active.push(instance);
  }
}

exports.Container = Container;
