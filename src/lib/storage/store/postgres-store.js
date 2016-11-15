const constants = require('../../constants/index');
const BaseStore = require('./base');
const pgtools = require('pgtools');


/*
 * This class should only contains static members.
 */
class PostgresStore extends BaseStore {
  static insert(connection, tableName, newDoc) {
    return connection.model(tableName).create(newDoc);
  }

  static select(connection, tableName, query) {
    return connection.model(tableName).findAll({ where: query });
  }

  static update(connection, tableName, query, newFieldValue) {
    return connection.model(tableName).update(newFieldValue, { where: query });
  }

  static delete(connection, tableName, query) {
    return connection.model(tableName).destroy({ where: query });
  }

  static createTable(connection, tableName, schema) {
    connection.define(tableName, schema);
    return connection.sync({ force: true });
  }

  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.model(tableName).drop();
  }

  static dropDb(connection, host1, port1, dbName) {
    console.log('in drop');
    return pgtools.dropdb({
      port: port1,
      host: host1,
    }, dbName, (err, res) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      }
    });
  }

  static createDb(host1, port1, dbName) {
    return pgtools.createdb({
      port: port1,
      host: host1,
    }, dbName, (err, res) => {
      if (err) {
        console.error(err);
      }
    });
  }


}
PostgresStore.STORE_TYPE = constants.STORE.TYPES.POSTGRES;

module.exports = exports = PostgresStore;
