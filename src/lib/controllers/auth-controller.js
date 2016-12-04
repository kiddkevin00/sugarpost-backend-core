const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');
const Promise = require('bluebird');

const containerId = process.env.HOSTNAME;
let requestCount = 0;

class AuthController {

  static subscribe(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const subscribeStrategy =  {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        storeType: constants.STORE.TYPES.MONGO_DB,
        type: constants.STORE.OPERATIONS.INSERT,
        data: [
          {
            email: state.email,
            emailValidated: false,
            dateCreated: new Date(),
            lastModified: null,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.SUBSCRIBER,
      uniqueFields: ['email'],
    };

    return AuthController._handleRequest(state, res, DatabaseService, subscribeStrategy)
      .then((result) => {


        requestCount += 1;

        return res.status(constants.SYSTEM.ERROR_CODES.OK)
          .json(result);
      });
  }

  static signup(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const signupStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        storeType: constants.STORE.TYPES.MONGO_DB,
        type: constants.STORE.OPERATIONS.INSERT,
        data: [
          {
            email: state.email,
            passwordHash: state.password, // [TODO]
            firstName: state.firstName,
            lastName: state.lastName,
            emailValidated: false,
            version: 0,
            suspended: false,
            dateCreated: new Date(),
            lastModified: null,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
      uniqueFields: ['email'],
    };

    return AuthController._handleRequest(state, res, DatabaseService, signupStrategy)
      .then((result) => {
        requestCount += 1;

        return res.status(constants.SYSTEM.ERROR_CODES.OK)
          .json(result);
      });
  }

  static login(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const signupStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          {
            email: state.email,
            passwordHash: state.password,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return AuthController._handleRequest(state, res, DatabaseService, signupStrategy)
      .then((result) => {
        let response;
        let statusCode;

        if (result && result.length) {
          response = { isAuthenticated: true };
          statusCode = constants.SYSTEM.ERROR_CODES.OK;
        } else {
          response = { isAuthenticated: false };
          statusCode = constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED;
        }

        requestCount += 1;

        return res.status(statusCode)
          .json(response);
      });
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy))
      .catch((_err) => {
        let err;

        if (_err instanceof StandardErrorWrapper) {
          err = _err;
        } else {
          err = new StandardErrorWrapper(_err);
        }
        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        });

        requestCount += 1;

        return res.status(constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR)
          .json(err.format({ containerId, requestCount }));
      });
  }

}

module.exports = exports = AuthController;
