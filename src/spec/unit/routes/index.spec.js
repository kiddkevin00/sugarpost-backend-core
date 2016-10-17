const setupRoutes = require('../../../lib/routes/');

describe('Route component', () => {
  let routeApp;
  let expressApp;

  beforeEach(() => {
    expressApp = { use: stub(), get: stub() };
    routeApp = setupRoutes(expressApp);
  });

  it('can be initialized', () => {
    expect(routeApp).to.equal(expressApp);
  });

  it('attaches "/ping" and "/health" checking routes', () => {
    expect(expressApp.get).to.have.been.calledWith('/ping', match.func);
    expect(expressApp.get).to.have.been.calledWith('/health', match.func);
  });

  it('attaches core routes', () => {
    expect(expressApp.use).to.have.been.calledWith('/admin', match.func);
  });

});
