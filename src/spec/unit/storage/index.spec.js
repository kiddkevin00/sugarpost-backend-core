const storeModule = require('../../../lib/storage/');

describe('Storage root', function () {

  describe('should contain all the classes that will be exposed to public within storage component', function () {

    it('including a repo factory class', function () {
      expect(storeModule.RepoFactory).to.exist;
    });

    it('including a connection pool class', function () {
      expect(storeModule.ConnectionPool).to.exist;
    });

  });

});
