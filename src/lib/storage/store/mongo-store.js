const BaseStore = require('./base');
const constants = require('../../constants/index');

/*
 * This class should only contains static members.
 */
class MongoStore extends BaseStore {

  static insert(connection, newDoc) {
    return connection.collection(connection).saveAsync(newDoc);
  }

  static select(connection, collectionName, query = {}) {
    return connection.collection(collectionName).findAsync(query);
  }

  static update(connection, collectionName, query, newFieldValues) {
    connection.collection(collectionName).updateAsync(query, { $set: newFieldValues },
      { multi: true });
  }

  static delete(connection, collectionName, query) {
    connection.collection(collectionName).removeAsync(query);
  }

  static configIndex(connection) {} // eslint-disable-line no-unused-vars

}
MongoStore.STORE_TYPE = constants.STORE.TYPES.MONGO_DB;

module.exports = exports = MongoStore;