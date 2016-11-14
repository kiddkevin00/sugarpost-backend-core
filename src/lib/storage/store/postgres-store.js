const constants = require('../../constants/index');
const BaseStore = require('./base');
const Sequelize = require('sequelize');


/*
 * This class should only contains static members.
 */
class PostgresStore extends BaseStore {
  static insert(connection, tableName, newDoc) {
    return connection.model(tableName).create(newDoc);
  }

  static select(connection, tableName, query) {
    return connection.model(tableName).findAll({where:query});
  }

  static update(connection, tableName, query, newFieldValue) {
    return connection.model(tableName).update(newFieldValue, {where:query});
  }

  static delete(connection, tableName, query) {
    return connection.model(tableName).destroy({where:query});
  }

  static createTable(connection, tableName, schema) {
    return connection.define(tableName, schema);
  }

  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.model(tableName).drop();
  }

  static dropDb(connection) {
    return connection.drop();
  }

}
PostgresStore.STORE_TYPE = constants.STORE.TYPES.POSTGRES;

module.exports = exports = PostgresStore;
