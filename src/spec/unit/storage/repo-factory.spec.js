const RepoFactory = require('../../../lib/storage/repo-factory');
const MongoStore = require('../../../lib/storage/store/mongo-store');
const constants = require('../../../lib/constants/');

describe('Repo factory', function () {
  let repo;
  let stubFuncs;

  beforeEach(function () {
    stubFuncs = [];
  });

  afterEach(function () {
    for (const stubFunc of stubFuncs) {
      stubFunc.restore();
    }
  });

  it('can manufacture an existed fully-functional repo :: manufacture()', function () {
    stubFuncs.push(stub(RepoFactory, '_validateStoreInterface'));

    repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);

    expect(RepoFactory._validateStoreInterface).to.have.been.calledWith(repo);
    expect(repo).to.equal(MongoStore);
  });

  it('can check if the store interface implemented fully :: _validateStoreInterface()', function () {
    repo = {
      insert: () => {},
      select: () => {},
      update: () => {},
      delete: () => {},
      configIndex: () => {},
      upsert: () => {},
      dropTable: () => {},
      dropDb: () => {},
    };

    expect(() => { RepoFactory._validateStoreInterface(repo); }).to.not.throw();
  });

});
