const SampleController = require('../../../lib/controllers/sample-controller');
const SampleSvc = require('../../../lib/services/sample-service');

describe('Sample controller', () => {
  let res;
  let stubFunc;

  beforeEach(() => {
    res = {};
    res.status = stub().returns(res);
    res.send = stub().returns(res);

    stubFunc = stub(SampleSvc, 'execute', () => Promise.resolve());
  });

  afterEach(() => {
    stubFunc.restore();
  });

  it('can handle general request', () =>
    expect(SampleController._handleRequest({}, res, SampleSvc))
      .to.eventually.equal(123));

});
