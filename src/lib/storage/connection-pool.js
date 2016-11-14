const constants = require('../constants/');
const packageJson = require('../../../package.json');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const Sequelize = require('sequelize');

Promise.promisifyAll([
  require('mongojs/lib/collection'), // eslint-disable-line global-require
  require('mongojs/lib/database'), // eslint-disable-line global-require
  require('mongojs/lib/cursor'), // eslint-disable-line global-require
]);

const mongoStorePropName = constants.STORE.TYPES.MONGO_DB;
const packageJsonMongoDbConfig = packageJson.config.databases[mongoStorePropName];

/*
 * This is the only class that is stateful for storage component.
 *
 * [Note] Don't cache the connection for the reason of separate concern: DB Connector (Driver)
 * should handle that itself if there is lots of connections created at the same time.
 */
class ConnectionPool {

  constructor(storeType = constants.STORE.TYPES.MONGO_DB,
              host = packageJsonMongoDbConfig.host,
              port = packageJsonMongoDbConfig.port,
              dbName = packageJsonMongoDbConfig.dbName) {
    this.connection = null;

    switch (storeType) {
      case constants.STORE.TYPES.MONGO_DB:
        this.connection = mongojs(`${host}:${port}/${dbName}`);
        break;

      case constants.STORE.TYPES.POSTGRES:
        this.connection = new Sequelize(`postgres://${host}:${port}/${dbName}`);
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

    return this.connection;
  }

}

module.exports = exports = ConnectionPool;
