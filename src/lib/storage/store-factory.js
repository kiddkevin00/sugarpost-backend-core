const Store = require('./store');

class StoreFactory {

  static manufacture(storeType) {
    return new Store(storeType);
  }

}

module.exports = exports = StoreFactory;
