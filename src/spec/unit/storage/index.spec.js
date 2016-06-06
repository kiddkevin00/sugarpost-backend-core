const storeModule = require('../../../lib/storage/');

describe('Store module', () => {
  it('exposes repo factory class', () => {
    expect(storeModule.RepoFactory).to.exist;
  });
  
  it('exposes connection pool class', () => {
    expect(storeModule.ConnectionPool).to.exist;
  });
});
