const BaseStore = require('./base');
const pg = require('pg').native;
const client = pg.Client;


/*
 * This class should only contains static members.
 */
class PostgresStore extends BaseStore {
  static insert(collectionName, newDoc) {
    client.query(`INSERT INTO ${collectionName} VALUES ${newDoc}`);
  }
}

module.exports = exports = PostgresStore;
