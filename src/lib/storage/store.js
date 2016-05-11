const MongoStore = require('./mongo-store');

const Stores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

class Store {

  static init(storeType) {
    if (Stores[storeType]) {
      Object.assign(Store, Stores[storeType]);
    }
    throw new Error('Encounter an invalid storage type.');
  }

  static upsert(connection) {

  }

  static resetCollection(connection, collectionName) {

  }

  static resetDb(connection, dbName) {

  }

}

// [Test]
var m = new MongoStore();
m.insert('bars', {name: 'bar1', musicStyle: 'style1', openHour: '24/7'})
m.insert('bars', {name: 'bar2', musicStyle: 'style2', openHour: '24/7'})
m.update('bars',{openHour: '24/7'}, {tag: 'tag2'});
//m.delete('bars', {});
m.select('bars', {});


module.exports = exports = Store;
