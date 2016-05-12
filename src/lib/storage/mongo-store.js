const constants = require('../constants/');

/*
 * This class should only contains static members
 */
class MongoStore {

  static insert(connection, newDoc) {
    return connection.saveAsync(newDoc);
  }

  static select(connection, collectionName, query) {
    connection.findAsync(query);
  }

  static update(connection, collectionName, query, newFieldValue) {
    connection.updateAsync(query, { $set: newFieldValue }, { multi: true });
  }

  static delete(connection, collectionName, query) {
    connection.removeAsync(query);
  }

  static configIndex(connection) {

  }

}
MongoStore.STORE_TYPE = constants.STORE_TYPE.MONGO_DB;

module.exports = exports = MongoStore;
