const constants = require('../constants/');
const packageJson = require('../../../package.json');
const mongojs = require('mongojs');
const Promise = require('bluebird');

Promise.promisifyAll(mongojs);

const cachedConnectedDBs = Symbol('cached-connected-db');
const packageJsonMongoDbConfig = packageJson.config.databases['mongo-store'];
const mongoConnectionString =
  `${packageJsonMongoDbConfig.host}:` +
  `${packageJsonMongoDbConfig.port}/` +
  `${packageJsonMongoDbConfig.dbName}`;

class ConnectionPool {

  constructor(storeType) {
    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        const mongoDbConnection = mongojs(mongoConnectionString);

        ConnectionPool[cachedConnectedDBs][constants.STORE.STORE_TYPES.MONGO_DB] = mongoDbConnection;
        break;
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }
  }

  static getCachedConnection(storeType) {
    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        return ConnectionPool[constants.STORE.STORE_TYPES.MONGO_DB];
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }
  }

  static removeConnection(storeType) {
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
