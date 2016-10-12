const SampleController = require('../../../lib/controllers/admin/sample-controller');
const SampleSvc = require('../../../lib/services/sample-service');

describe('Sample controller', () => {
  let res;
  let noop;
  let stubFunc;

  beforeEach(() => {
    res = {};
    res.status = stub().returns(res);
    res.send = stub().returns(res);

    noop = () => {};
  });

  afterEach(() => {
    stubFunc.restore();
  });

  it('can handle general request', () => {
    stubFunc = stub(SampleSvc, 'execute', () => Promise.resolve());

    return expect(SampleController._handleRequest(null, res, SampleSvc))
      .to.eventually.equal(res);
  });

});
