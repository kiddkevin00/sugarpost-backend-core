const SampleController = require('../../../lib/controllers/admin/sample-controller');
const SampleSvc = require('../../../lib/services/sample-service');

describe('Sample controller', () => {
  let req;
  let res;
  let noop;

  beforeEach(() => {
    req = stub();
    res = {
      status: spy(),
    };
    noop = () => {};
  });

  it('can handle general request', () => {
    const promise = new Promise((resolve, reject) => {
      return resolve();
    });
    const execute = stub(SampleSvc, 'execute', () => {
      return promise;
    });

    SampleController._handleRequest(req, res, SampleSvc);

    execute.restore();

    return expect(promise).to.be.fulfilled;
  });

});
