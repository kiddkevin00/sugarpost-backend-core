const RepoFactory = require('../../../lib/storage/repo-factory');
const constants = require('../../../lib/constants/');

describe('Repo factory', () => {
  let repo;
  let noop;

  beforeEach(() => {
    repo = {};
  });

  it('can manufacture a new fully-functional repo', () => {
    repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);

    expect(repo).to.have.property('insert').that.is.an('function');
    expect(repo).to.have.property('select').that.is.an('function');
    expect(repo).to.have.property('update').that.is.an('function');
    expect(repo).to.have.property('delete').that.is.an('function');
    expect(repo).to.have.property('configIndex').that.is.an('function');
    expect(repo).to.have.property('upsert').that.is.an('function');
    expect(repo).to.have.property('resetTable').that.is.an('function');
    expect(repo).to.have.property('resetDb').that.is.an('function');
  });

  it('check if the store interface fully implemented', () => {
    repo = {
      insert: () => {},
      select: () => {},
      update: () => {},
      delete: () => {},
      configIndex: () => {},
      upsert: () => {},
      resetTable: () => {},
      resetDb: () => {},
    };

    expect(RepoFactory._isStoreInterfaceImplemented(repo)).to.be.true;
  });

});
