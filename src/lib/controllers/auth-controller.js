const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

const containerId = process.env.HOSTNAME;
let requestCount = 0;

class AuthController {

  static signup(req, res) {
    const signupStrategy = {
      operation: constants.STORE.OPERATIONS.INSERT,
      tableName: constants.STORE.TABLE_NAMES.USER,
      uniqueFields: ['email'],
    };
    const options = req.body;

    return AuthController._handleRequest(options, res, DatabaseService, signupStrategy);
  }

  static _handleRequest(options = {}, res, Svc, strategy) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);

    return Svc.execute(state, strategy)
      .then((result) => {
        requestCount += 1;

        return res.status(constants.SYSTEM.STATUS_CODES.OK)
          .send(result);
      })
      .catch((_err) => {
        let err;

        if (_err instanceof StandardErrorWrapper) {
          err = _err;
        } else {
          err = new StandardErrorWrapper(_err);
        }

        err.append({
          code: constants.SYSTEM.STATUS_CODES.INTERNAL_SERVER_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        });

        res.status(constants.SYSTEM.STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json(err.format({ containerId, requestCount }));

        requestCount += 1;
      });
  }

}

module.exports = exports = AuthController;
