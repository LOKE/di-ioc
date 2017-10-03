'use strict';

class Interface {
  constructor(def, longName) {
    this.validate = def.factory;
    this.longName = longName;
  }
}

exports.Interface = Interface;
