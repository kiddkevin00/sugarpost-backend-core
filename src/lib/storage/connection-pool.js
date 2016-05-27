const constants = require('../constants/');
const packageJson = require('../../../package.json');
const Promise = require('bluebird');
const mongojs = require('mongojs');

Promise.promisifyAll([
  require("mongojs/lib/collection"),
  require("mongojs/lib/database"),
  require("mongojs/lib/cursor")
]);

const mongoStorePropName = 'mongo-store';
const packageJsonMongoDbConfig = packageJson.config.databases[mongoStorePropName];
const cachedConnectedDBs = Symbol('cached-connected-db');


/*
 * This is the only class that is stateful.
 */
class ConnectionPool {

  constructor(storeType, host = packageJsonMongoDbConfig.host, port = packageJsonMongoDbConfig.port, dbName = packageJsonMongoDbConfig.dbName) {
    let connection;

    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        connection = mongojs(`${host}:${port}/${dbName}`);
        break;
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }

    ConnectionPool._cacheConnection(connection, storeType);

    return connection;
  }

  static _cacheConnection(connection, storeType) {
    ConnectionPool[cachedConnectedDBs][storeType] = connection;
  }

  static getCachedConnection(storeType) {
    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        return ConnectionPool[cachedConnectedDBs][constants.STORE.STORE_TYPES.MONGO_DB];
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }
  }

  static removeCachedConnection(storeType) {
    ConnectionPool[cachedConnectedDBs][storeType] = null;
  }

  static resetConnectionPool() {
    ConnectionPool[cachedConnectedDBs] = {
      [constants.STORE.STORE_TYPES.MONGO_DB]: null
    };
  }

}
ConnectionPool[cachedConnectedDBs] = {
  [constants.STORE.STORE_TYPES.MONGO_DB]: null,
};

module.exports = exports = ConnectionPool;
