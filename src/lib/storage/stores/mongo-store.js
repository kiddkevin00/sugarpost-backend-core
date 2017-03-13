const BaseStore = require('./base');
const constants = require('../../constants/');

/*
 * This class should only contains static members.
 */
class MongoStore extends BaseStore {

  static insert(connection, collectionName, newDoc) {
    return connection.client.collection(collectionName).saveAsync(newDoc);
  }

  static select(connection, collectionName, query = {}) {
    return connection.client.collection(collectionName).findAsync(query);
  }

  static update(connection, collectionName, query, newFieldValueMap, isSpecialUpdate = false) {
    // [TODO] Use `connection.client.findAndModifyAsync()` instead to return the updated documents.
    if (isSpecialUpdate) {
      return connection.client.collection(collectionName).updateAsync(query, { newFieldValueMap },
        { multi: true });
    }
    return connection.client.collection(collectionName).updateAsync(query,
      { $set: newFieldValueMap }, { multi: true });
  }

  static delete(connection, collectionName, query) {
    return connection.client.collection(collectionName).removeAsync(query);
  }

  // [TODO]
  static configIndex(connection) {

  }

  static dropTable(connection, tableName) {
    return connection.client.collection(tableName).dropAsync();
  }

  static dropDb(connection) {
    return connection.client.dropDatabaseAsync();
  }

  static close(connection) {
    return connection.client.closeAsync();
  }

  static on(connection, event) {
    return connection.client.onAsync(event);
  }

}
MongoStore.STORE_TYPE = constants.STORE.TYPES.MONGO_DB;

module.exports = exports = MongoStore;
