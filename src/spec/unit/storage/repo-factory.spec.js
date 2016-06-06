const RepoFactory = require('../../../lib/storage/repo-factory');
const MongoStore = require('../../../lib/storage/mongo-store');
const constants = require('../../../lib/constants/');

describe('Repo factory', () => {
  let repo;

  beforeEach(() => {
    repo = {};

    stub(MongoStore, 'insert');
    stub(MongoStore, 'select');
    stub(MongoStore, 'update');
    stub(MongoStore, 'delete');
    stub(MongoStore, 'configIndex');
  });
  
  afterEach(() => {
    MongoStore.insert.restore();
    MongoStore.select.restore();
    MongoStore.update.restore();
    MongoStore.delete.restore();
    MongoStore.configIndex.restore();
  });

  it('can assign lower level operations to a repo', () => {
    RepoFactory._assignLowLevelOperations(constants.store.STORE_TYPES.MONGO_DB, repo);

    expect(repo).to.have.property('insert').that.is.an('function');
    expect(repo).to.have.property('select').that.is.an('function');
    expect(repo).to.have.property('update').that.is.an('function');
    expect(repo).to.have.property('delete').that.is.an('function');
  });

  it('can assign high level operations to a repo', () => {
    RepoFactory._assignHighLevelOperations(repo);

    expect(repo).to.have.property('upsert').that.is.an('function');
    expect(repo).to.have.property('resetCollection').that.is.an('function');
    expect(repo).to.have.property('resetDb').that.is.an('function');
  });

});
