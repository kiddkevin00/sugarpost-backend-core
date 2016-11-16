const constants = require('../../constants/index');
const BaseStore = require('./base');
const pgtools = require('pgtools');
const Sequelize = require('sequelize');

/*
 * This class should only contains static members.
 */
class PostgresStore extends BaseStore {
  static insert(connection, tableName, newDoc) {
    return connection.client.model(tableName).create(newDoc);
  }

  static select(connection, tableName, query) {
    return connection.client.model(tableName).findAll({ where: query });
  }

  static update(connection, tableName, query, newFieldValue) {
    return connection.client.model(tableName).update(newFieldValue, { where: query });
  }

  static delete(connection, tableName, query) {
    return connection.client.model(tableName).destroy({ where: query });
  }

  static createTable(connection, tableName, schema) {
    connection.client.define(tableName, schema);
    return connection.client.sync({ force: true });
  }

  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.client.model(tableName).drop();
  }
  
  static dropDb(connection) {
    const host = connection.host;
    const port = connection.port;
    const adminDbName = 'postgres';
    const s = new Sequelize(`postgres://${host}:${port}/${adminDbName}`);

    return s.query('DROP DATABASE "testingDb"');
  }

  static close(connection) {
    connection.close();
  }

  // [TODO]
  static on(connection, event) {

  }

  static createDb(host, port, dbName) {
    const s = new Sequelize(`postgres://${host}:${port}`);

    return s.query(`CREATE DATABASE "${dbName}"`);
  }

}
PostgresStore.STORE_TYPE = constants.STORE.TYPES.POSTGRES;

module.exports = exports = PostgresStore;
