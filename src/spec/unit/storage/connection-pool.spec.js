const constants = require('../../../lib/constants/index');
const ConnectionPool = require('../../../lib/storage/connection-pool');
const RepoFactory = require('../../../lib/storage/repo-factory');

var c = new ConnectionPool(constants.STORE.STORE_TYPES.MONGO_DB);
var s = RepoFactory.manufacture(constants.STORE.STORE_TYPES.MONGO_DB);

s.select(c, 'bars', {})
  .then((d) => {
    console.log(d);

    c.close();
  });

describe('test', function() {
  it('has a dummy spec', function() {
    expect(true).to.equal(true);

  });

  it('has another dummy spec', function() {
    expect(true).to.equal(true);

  });
})

