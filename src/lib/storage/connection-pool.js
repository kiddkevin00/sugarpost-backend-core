// [TOOD]
// Find the best wat to promisify `mongojs`

const packageJson = require('../../../package.json');
const mongojs = require('mongojs');

const cachedConnectedDb = Symbol('cached-connected-db');
const packageJsonMongoDbConfig = packageJson.config.databases['mongo-store'];

class ConnectionPool {

  constructor() {

  }

  addConnection() {

  }

  getConnection() {

  }

  removeConnection() {

  }

}

module.exports = exports = ConnectionPool;
