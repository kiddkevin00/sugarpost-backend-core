class MongoStore {

  static insert(connection, newDoc) {
    return connection.save(newDoc);
  }

  static select(connection, collectionName, query) {
    connection.find(query, (err, docs) => {
      console.log(docs);
    });
  }

  static update(connection, collectionName, query, newFieldValue) {
    connection.update(
      query, { $set: newFieldValue }, { multi: true },
      (err, result) => {
        console.log(result);
      }
    );
  }

  static delete(connection, collectionName, query) {
    connection.remove(query);
  }

  static configIndex(connection) {

  }

}

MongoStore.STORE_TYPE = 'mongo-store';

module.exports = exports = MongoStore;
