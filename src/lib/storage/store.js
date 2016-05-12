const MongoStore = require('./mongo-store');
const constants = require('../constants/');

const Stores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

/*
 * This class should only contains static members
 */
class Store {

  static init(storeType) {
    if (Stores[storeType]) {
      Object.assign(Store, Stores[storeType]);
    }
    throw new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE);
  }

  static upsert(connection) {

  }

  static resetCollection(connection, collectionName) {

  }

  static resetDb(connection, dbName) {

  }

}

module.exports = exports = Store;
