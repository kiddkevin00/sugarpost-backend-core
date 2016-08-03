const RepoFactory = require('../../../lib/storage/repo-factory');
const constants = require('../../../lib/constants/');

describe('Repo factory', () => {
  let repo;

  beforeEach(() => {
    repo = {};
  });

  it('can assign lower level operations (MongoDB) to a repo', () => {
    repo = RepoFactory._assignLowLevelOperations(constants.STORE.STORE_TYPES.MONGO_DB);

    expect(repo).to.have.property('insert').that.is.an('function');
    expect(repo).to.have.property('select').that.is.an('function');
    expect(repo).to.have.property('update').that.is.an('function');
    expect(repo).to.have.property('delete').that.is.an('function');
  });

  it('can assign high level operations to a repo', () => {
    repo = RepoFactory._assignHighLevelOperations(repo);

    expect(repo).to.have.property('upsert').that.is.an('function');
    expect(repo).to.have.property('resetCollection').that.is.an('function');
    expect(repo).to.have.property('resetDb').that.is.an('function');
  });

  it('can manufacture a fully-functional repo', () => {
    repo = RepoFactory.manufacture(constants.STORE.STORE_TYPES.MONGO_DB);

    expect(repo).to.have.property('insert').that.is.an('function');
    expect(repo).to.have.property('select').that.is.an('function');
    expect(repo).to.have.property('update').that.is.an('function');
    expect(repo).to.have.property('delete').that.is.an('function');
    expect(repo).to.have.property('upsert').that.is.an('function');
    expect(repo).to.have.property('resetCollection').that.is.an('function');
    expect(repo).to.have.property('resetDb').that.is.an('function')
  });
});
