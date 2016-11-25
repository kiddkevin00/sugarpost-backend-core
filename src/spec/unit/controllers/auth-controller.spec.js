const SampleController = require('../../../lib/controllers/auth-controller');
const SampleSvc = require('../../../lib/services/database-service');

describe('Sample controller', function () {
  let req;
  let res;
  let stubFuncs;

  beforeEach(function () {
    req = {};
    res = {};
    stubFuncs = [];
  });

  afterEach(function () {
    for (const stubFunc of stubFuncs) {
      stubFunc.restore();
    }
  });

  // [TODO]
  it('can handle signup request :: login()', function () {

  });

  // [TODO]
  it('can handle login request :: login()', function () {
    const result = {};
    const expectedResult = JSON.parse(JSON.stringify(result));

    stubFuncs.push(stub(SampleController, '_handleRequest', () => Promise.resolve(result)));

    const promise = SampleController.login(req, res);

    expect(SampleController._handleRequest).to.have.been.calledWith(req, res);
    return expect(promise).to.be.eventually.deep.equal(expectedResult);
  });

  describe('can handle general request :: _handleRequest()', () => {

    beforeEach(function () {
      res.status = stub().returnsThis;
      res.send = stub().returnsThis;
      res.json = stub().returnsThis;
      stubFuncs.push(stub(SampleSvc, 'execute'));
    });

    it('on success', function () {
      const strategy = {};

      SampleSvc.execute.returns(Promise.resolve());

      const promise = SampleController._handleRequest({}, res, SampleSvc, strategy);

      expect(SampleSvc.execute).to.have.been.calledWith(match.object, strategy);
      return expect(promise).to.eventually.equal(res);
    });

    it('on failure', function () {
      const strategy = {};

      SampleSvc.execute.returns(Promise.reject());

      const promise = SampleController._handleRequest({}, res, SampleSvc, strategy);

      expect(SampleSvc.execute).to.have.been.calledWith(match.object, strategy);
      return expect(promise).to.eventually.equal(res);
    });

  });

});
