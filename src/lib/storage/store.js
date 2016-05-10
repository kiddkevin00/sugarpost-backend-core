const MongoStore = require('./mongo-store');

const Stores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};
const store = new Symbol('store');

class Store {

  constructor(storeType) {
    if (Stores[storeType]) {
      this[store] = new Stores[storeType];
    }
    throw new Error('Encounter an invalid storage type.');
  }

  select(collectionName, query) {
    // [TODO] Should return a Promise
    return this[store].select(collectionName, query);
  }

  insert() {

  }

  update() {

  }

  delete() {

  }

  upsert() {

  }

  resetCollection(collectionName) {

  }

  resetDb(dbName) {

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
