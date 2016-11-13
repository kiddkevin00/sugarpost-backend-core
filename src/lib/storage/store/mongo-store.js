const BaseStore = require('./base');
const constants = require('../../constants/index');

/*
 * This class should only contains static members.
 */
class MongoStore extends BaseStore {

  static insert(connection, collectionName, newDoc) {
    return connection.collection(collectionName).saveAsync(newDoc);
  }

  static select(connection, collectionName, query = {}) {
    return connection.collection(collectionName).findAsync(query);
  }

  static update(connection, collectionName, query, newFieldValues) {
    return connection.collection(collectionName).updateAsync(query, { $set: newFieldValues },
      { multi: true });
  }

  static delete(connection, collectionName, query) {
    return connection.collection(collectionName).removeAsync(query);
  }

  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.collection(tableName).dropAsync();
  }

  static dropDb(connection) {
    return connection.dropDatabaseAsync();
  }

  static close(connection) {
    return connection.closeAsync();
  }

  static on(connection, event) {
    return connection.onAsync(event);
  }

}
MongoStore.STORE_TYPE = constants.STORE.TYPES.MONGO_DB;

module.exports = exports = MongoStore;
