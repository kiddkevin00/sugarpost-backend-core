const AuthController = require('../../../lib/controllers/auth.controller');
const DatabaseSvc = require('../../../lib/services/database.service');

describe('Auth controller', function () {
  let req;
  let res;
  let stubFuncs;

  beforeEach(function () {
    res = {};
    res.status = stub().returnsThis;
    res.json = stub().returnsThis;

    req = {};
    stubFuncs = [];
  });

  afterEach(function () {
    for (const stubFunc of stubFuncs) {
      stubFunc.restore();
    }
  });

  // [TODO]
  describe('can handle subscribe request :: subscribe()', function () {

  });

  // [TODO]
  describe('can handle signup request :: signup()', function () {

  });

  describe('can handle login request :: login()', function () {

    it('on success', function () {
      stubFuncs.push(stub(AuthController, '_handleRequest', () => Promise.resolve()));

      req.body = {
        email: 'foo@bar.com',
        password: 'foobar-secret',
      };

      const promise = AuthController.login(req, res);

      expect(AuthController._handleRequest).to.have.been.calledWith(match.object, res);
      return expect(promise).to.eventually.deep.equal(res);
    });

    it('on error', function () {
      stubFuncs.push(stub(AuthController, '_handleRequest', () => Promise.reject()));

      req.body = {
        email: 'foo@bar.com',
        password: 'foobar-secret',
      };

      const promise = AuthController.login(req, res);

      expect(AuthController._handleRequest).to.have.been.calledWith(match.object, res);
      return expect(promise).to.eventually.deep.equal(res);
    });

  });

  describe('can handle general request :: _handleRequest()', function () {

    beforeEach(function () {
      stubFuncs.push(stub(DatabaseSvc, 'execute'));
    });

    it('on success', function () {
      const result = {};
      const expectedResult = JSON.parse(JSON.stringify(result));
      const state = {};
      const strategy = {};

      DatabaseSvc.execute.returns(Promise.resolve(result));

      const promise = AuthController._handleRequest(state, res, DatabaseSvc, strategy);

      expect(DatabaseSvc.execute).to.have.been.calledWith(state, strategy);
      return expect(promise).to.eventually.deep.equal(expectedResult);
    });

  });

});
