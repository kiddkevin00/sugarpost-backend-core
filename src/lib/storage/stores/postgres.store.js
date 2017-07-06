const BaseStore = require('./base');
const constants = require('../../constants/');
const packageJson = require('../../../../package.json');
const Sequelize = require('sequelize');


const storeType = constants.STORE.TYPES.POSTGRES;
const packageJsonDbConfig = packageJson.config.databases[storeType];

/**
 * This class implements of the base store interface.  It should only contain static members.
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

  // [TODO]
  static configIndex(/*connection*/) {

  }

  static dropTable(connection, tableName) {
    return connection.client.model(tableName).drop();
  }

  static dropDb(connection) {
    const host = connection.host;
    const port = connection.port;
    const dbName = connection.dbName;
    const adminDbName = 'postgres';
    const sequelize = new Sequelize(`postgres://${host}:${port}/${adminDbName}`,
      packageJsonDbConfig.options);

    return sequelize.query(`DROP DATABASE "${dbName}"`);
  }

  static close(connection) {
    connection.close();
  }

  // [TODO]
  static on(/*connection, event*/) {

  }

  static createTable(connection, tableName, schema) {
    connection.client.define(tableName, schema);
    return connection.client.sync({ force: true });
  }

  static createDb(
    host = packageJsonDbConfig.host,
    port = packageJsonDbConfig.port,
    dbName = packageJsonDbConfig.dbName
  ) {
    const sequelize = new Sequelize(`postgres://${host}:${port}`, packageJsonDbConfig.options);

    return sequelize.query(`CREATE DATABASE "${dbName}"`);
  }

}
PostgresStore.STORE_TYPE = storeType;

module.exports = exports = PostgresStore;
