const constants = require('../constants/');
const packageJson = require('../../../package.json');
const Promise = require('bluebird');
const mongojs = require('mongojs');

Promise.promisifyAll([
  require('mongojs/lib/collection'), // eslint-disable-line global-require
  require('mongojs/lib/database'), // eslint-disable-line global-require
  require('mongojs/lib/cursor'), // eslint-disable-line global-require
]);

const mongoStorePropName = constants.STORE.TYPES.MONGO_DB;
const packageJsonMongoDbConfig = packageJson.config.databases[mongoStorePropName];

/*
 * This is the only class that is stateful in storage module.
 *
 * [Note] Don't cache the connection for the reason of separate concern: DB Connector (Driver)
 * should handle that itself if there is lots of connections created at the same time.
 */
class ConnectionPool {

  constructor(storeType = constants.STORE.TYPES.MONGO_DB,
              host = packageJsonMongoDbConfig.host,
              port = packageJsonMongoDbConfig.port,
              dbName = packageJsonMongoDbConfig.dbName) {
    let connection;

    switch (storeType) {
      case constants.STORE.TYPES.MONGO_DB:
        connection = mongojs(`${host}:${port}/${dbName}`);
        break;

      default:
        throw(new Error({
          errors: [
            {
              code: constants.STORE.ERROR_CODES.STORAGE_TYPE_NOT_FOUND,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.STORE.ERROR_MSG.STORAGE_TYPE_NOT_FOUND,
            },
          ],
        }));
    }

    return connection;
  }

}

module.exports = exports = ConnectionPool;
