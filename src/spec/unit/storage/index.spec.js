const storeModule = require('../../../lib/storage/');

describe('Storage module', () => {

  it('exposes a repo factory class', () => {
    expect(storeModule.RepoFactory).to.exist;
  });

  it('exposes a connection pool class', () => {
    expect(storeModule.ConnectionPool).to.exist;
  });

});
