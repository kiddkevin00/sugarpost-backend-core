// [TODO] Not Update yet

const MongoStore = require('../../../../lib/storage/store/mongo-store');
const ConnectionPool = require('../../../../lib/storage/connection-pool');

describe('Mongo (low-level) store', () => {

  it('implement insert functionality', () => {
    expect(MongoStore).to.have.property('insert').that.is.an('function');

    const connection = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);

    MongoStore.insert(connection)
  });

  it('implement select functionality', () => {
    expect(MongoStore).to.have.property('select').that.is.an('function');

  });

  it('implement update functionality', () => {
    expect(MongoStore).to.have.property('update').that.is.an('function');

  });

  it('implement delete functionality', () => {
    expect(MongoStore).to.have.property('delete').that.is.an('function');

  });

  it('implement configuring index functionality', () => {
    expect(MongoStore).to.have.property('configIndex').that.is.an('function');

  });

});
