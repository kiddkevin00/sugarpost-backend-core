const constants = require('../constants/');

/*
 * This class should only contains static members.
 */
class MongoStore {
  
  static insert(connection, newDoc) {
    return connection.saveAsync(newDoc);
  }

  static select(connection, collectionName, query) {
    return connection.collection(collectionName).findAsync(query || {})
  }

  static update(connection, collectionName, query, newFieldValue) {
    connection.collection(collectionName).updateAsync(query, { $set: newFieldValue }, { multi: true });
  }

  static delete(connection, collectionName, query) {
    connection.collection(collectionName).removeAsync(query);
  }

  static configIndex(connection) {

  }

}
MongoStore.STORE_TYPE = constants.STORE.STORE_TYPES.MONGO_DB;

module.exports = exports = MongoStore;
