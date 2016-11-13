const BaseStore = require('./base');


/*
 * This class should only contains static members.
 */
class PostgresStore extends BaseStore {
  static insert(connection, collectionName, newDoc) {
    connection.collection(collectionName).create(newDoc).save();
  }

  static select(connection, collectionName, query) {
    connection.collection(collectionName).find(query).save();
  }

  static update(connection, collectionName, query, newFieldValues) {
    connection.collection(collectionName).update(newFieldValues, query).save();
  }

  static delete(connection, collectionName, query) {
    connection.collection(collectionName).destroy(query).save();
  }
}

module.exports = exports = PostgresStore;
