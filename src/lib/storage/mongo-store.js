const packageJson = require('../../../package.json');
const mongojs = require('mongojs');

// [TOOD]
// Find the best wat to promisify `mongojs`
// Decide whether changing static methods to instance methods or not

const cachedConnectedDb = Symbol('cached-connected-db');
const packageJsonMongoDbConfig = packageJson.config.databases['mongo-store'];

class MongoStore {

  constructor() {
    MongoStore._connect();
  }

  select(collectionName, query) {
    MongoStore._getCollection(collectionName)
      .find(query, (err, docs) => {
        console.log(docs);
      });
  }

  insert(collectionName, newDoc) {
    MongoStore._getCollection(collectionName)
      .save(newDoc);

  }

  update(collectionName, query, newFieldValue) {
    MongoStore._getCollection(collectionName)
      .update(
        query, { $set: newFieldValue }, { multi: true },
        (err, result) => {
          console.log(result);
        }
      );
  }

  delete(collectionName, query) {
    MongoStore._getCollection(collectionName)
      .remove(query);
  }

  static _connect() {
    if (!MongoStore[cachedConnectedDb]) {
      const connectionString = 'mongodb://' +
        `${packageJsonMongoDbConfig.host}:` +
        `${packageJsonMongoDbConfig.port}/` +
        `${packageJsonMongoDbConfig.dbName}`;

      MongoStore[cachedConnectedDb] = mongojs(connectionString);
    }
  }

  _disconnect() {
    this[cachedConnectedDb] = null;
  }

  static _getCollection(collectionName) {
    MongoStore._connect();

    return MongoStore[cachedConnectedDb].collection(collectionName);
  }


  configIndex() {

  }

}

MongoStore.STORE_TYPE = 'mongo-store';
MongoStore[cachedConnectedDb] = null;

module.exports = exports = MongoStore;
