const constants = require('../constants/');
const packageJson = require('../../../package.json');
const mongojs = require('mongojs');
const Promise = require('bluebird');

Promise.promisifyAll([
  require("mongojs/lib/collection"),
  require("mongojs/lib/database"),
  require("mongojs/lib/cursor")
]);

const mongoStorePropName = 'mongo-store';
const packageJsonMongoDbConfig = packageJson.config.databases[mongoStorePropName];
const mongoConnectionString = `${packageJsonMongoDbConfig.host}:` +
  `${packageJsonMongoDbConfig.port}/${packageJsonMongoDbConfig.dbName}`;
const cachedConnectedDBs = Symbol('cached-connected-db');

class ConnectionPool {

  constructor(storeType) {
    let connection;

    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        connection = mongojs(mongoConnectionString);
        break;
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }

    ConnectionPool[cachedConnectedDBs][storeType] = connection;

    return connection;
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
