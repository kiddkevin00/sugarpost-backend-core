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

/*
 * This is the only class that is stateful.
 *
 * [Note] Don't cache the connection for the reason of separate concern: DB Connectivity (Driver)
 * should handle that itself if there is lots of connections created at the same time.
 */
class ConnectionPool {

  constructor(storeType, host = packageJsonMongoDbConfig.host, port = packageJsonMongoDbConfig.port, 
              dbName = packageJsonMongoDbConfig.dbName) {
    let connection;

    switch (storeType) {
      case constants.STORE.STORE_TYPES.MONGO_DB:
        connection = mongojs(`${host}:${port}/${dbName}`);
        break;
      default:
        throw(new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE));
    }
    
    return connection;
  }


}

module.exports = exports = ConnectionPool;
