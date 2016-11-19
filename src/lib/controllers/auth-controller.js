const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

const containerId = process.env.HOSTNAME;
let requestCount = 0;

class AuthController {

  static signup(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const signupStrategy = {
      operation: {
        type: constants.STORE.OPERATIONS.INSERT,
        data: [
          {
            email: state.email,
            password: state.password,
            firstName: state.firstName,
            lastName: state.lastName,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
      uniqueFields: ['email'],
    };

    return AuthController._handleRequest(state, res, DatabaseService, signupStrategy)
      .then((result) => {
        requestCount += 1;

        return res.status(constants.SYSTEM.STATUS_CODES.OK)
          .send(result);
      });
  }

  static login(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const signupStrategy = {
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          {
            email: state.email,
            password: state.password,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };
    const options = req.body;

    return AuthController._handleRequest(options, res, DatabaseService, signupStrategy)
      .then((result) => {
        const response = { isAuthenticated: false };
        let statusCode = constants.SYSTEM.STATUS_CODES.UNAUTHENTICATED;

        if (result.length) {
          response.isAuthenticated = true;
          statusCode = constants.SYSTEM.STATUS_CODES.OK;
        }

        requestCount += 1;

        return res.status(statusCode)
          .send(response);
      });
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Svc.execute(state, strategy)
      .catch((_err) => {
        let err;

        if (_err instanceof StandardErrorWrapper) {
          err = _err;
        } else {
          console.log(_err)
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
