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
    return connection.model(tableName).findAll(query);
  }

  static update(connection, tableName, query, newFieldValues) {
    return connection.model(tableName).update(newFieldValues, query);
  }

  static delete(connection, tableName, query) {
    return connection.model(tableName).destroy(query);
  }

  static createTable(connection, tableName, schema) {
    return connection.define(tableName, schema).sync();
  }

  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.drop(tableName);
  }

  static dropDb(connection) {
    return connection.dropDatabaseAsync();
  }


 // {columnName: {type: 'string', allowNull: true} }
  static _normalizeSchema(schema) {
    for (const key in schema) {
      const type = schema[key].type.toUpperCase()
      // console.log(schema[key].type.toUpperCase(), Sequelize[type])
      schema[key].type= Sequelize.STRING;
    }
    console.log(schema)
    return schema
  }
}
PostgresStore.STORE_TYPE = constants.STORE.TYPES.POSTGRES;

module.exports = exports = PostgresStore;
