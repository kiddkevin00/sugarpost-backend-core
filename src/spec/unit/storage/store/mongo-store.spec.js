// [TODO] Not Update yet

const MongoStore = require('../../../../lib/storage/store/mongo-store');

describe('Mongo (low-level) store', () => {

  it('implements insert functionality', () => {
    expect(MongoStore).to.have.property('insert').that.is.an('function');
  });

  it('implements select functionality', () => {
    expect(MongoStore).to.have.property('select').that.is.an('function');

  });

  it('implements update functionality', () => {
    expect(MongoStore).to.have.property('update').that.is.an('function');

  });

  it('implements delete functionality', () => {
    expect(MongoStore).to.have.property('delete').that.is.an('function');

  });

  it('implements configuring index functionality', () => {
    expect(MongoStore).to.have.property('configIndex').that.is.an('function');

  });

  it('implements resetting table functionality', () => {
    expect(MongoStore).to.have.property('dropTable').that.is.a('function');

  });

  it('implements resetting DB functionality', () => {
    expect(MongoStore).to.have.property('dropDb').that.is.a('function');

  });

});
