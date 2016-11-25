const setupExpressServer = require('../../../lib/server/express-server');
const compression = require('compression');

// [TODO]
describe('Express server', function () {
  let expressApp;
  let app;

  beforeEach(() => {
    expressApp = { use: stub(), get: stub() };
  });

  it('can be initialized', () => {
    app = setupExpressServer(expressApp);

    expect(app).to.equal(expressApp);
  });
  
  it('attaches middleware for compression ', function () {
    const s = spy(compression);

    app = setupExpressServer(expressApp);

    expect(s).to.have.been.called;
  });

  it('attaches middles for parsing request body', function () {

  });

});
