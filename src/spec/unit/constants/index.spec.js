const constants = require('../../../lib/constants/');

describe('Constants root', function () {

  describe('should contain all the exposed object(s) within constants component', function () {

    it('including a SYSTEM object', function () {
      expect(constants.SYSTEM).to.exist;
    });

    it('including a STORE object', function () {
      expect(constants.STORE).to.exist;
    });

  });

});
