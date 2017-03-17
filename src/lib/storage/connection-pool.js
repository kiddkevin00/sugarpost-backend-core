const StandardErrorWrapper = require('../utility/standard-error-wrapper');
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

/**
 * This is the only class that is stateful for storage component.
 *
 * [Note] Don't cache the connection for the reason of separate concern.  DB Connector (Driver)
 * should be the one that handles that itself if there is lots of connections created at the same
 * time.
 */
class ConnectionPool {

  constructor(storeType = constants.STORE.TYPES.MONGO_DB, host, port, dbName, dbUser, dbPassword) {
    const packageJsonDbConfig = packageJson.config.databases[storeType];
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_FOUND,
        name: constants.STORE.ERROR_NAMES.STORAGE_TYPE_NOT_FOUND,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.STORAGE_TYPE_NOT_FOUND,
      },
    ]);

    this.client = null;
    this.host = host || packageJsonDbConfig.host;
    this.port = port || packageJsonDbConfig.port;
    this.dbName = dbName || packageJsonDbConfig.dbName;
    this.dbUser = dbUser;
    this.dbPassword = dbPassword;

    switch (storeType) {
      case constants.STORE.TYPES.MONGO_DB:
        if (this.dbUser && this.dbPassword) {
          this.client = mongojs(`mongodb://${this.dbUser}:${this.dbPassword}@${this.host}:` +
            `${this.port}/${this.dbName}`, [], packageJsonDbConfig.options);
        } else {
          this.client = mongojs(`mongodb://${this.host}:${this.port}/${this.dbName}`, [],
            packageJsonDbConfig.options);
        }

        break;
      case constants.STORE.TYPES.POSTGRES:
        if (this.dbUser && this.dbPassword) {
          this.client = new Sequelize(`postgres://${this.dbUser}:${this.dbPassword}@${this.host}:` +
            `${this.port}/${this.dbName}`, packageJsonDbConfig.options);
        } else {
          this.client = new Sequelize(`postgres://${this.host}:${this.port}/${this.dbName}`,
            packageJsonDbConfig.options);
        }

        break;
      default:
        throw(err);
    }
  }

}

module.exports = exports = ConnectionPool;
