const SampleController = require('../../../lib/controllers/sample-controller');

describe('Sample controller', () => {
  let req;
  let res;
  let noop;

  beforeEach(() => {
    req = stub();
    res = {
      status: spy()
    };
    noop = function () {
    };
  });

  it('can handle general request', () => {
    const svc = {
      execute: noop
    };

    let promise;

    stub(svc, 'execute', () => {
      promise = Promise.resolve(true);
      return promise;
    });

    SampleController._handleRequest(req, res, svc);

    return expect(promise).to.be.fulfilled;
  });
});
