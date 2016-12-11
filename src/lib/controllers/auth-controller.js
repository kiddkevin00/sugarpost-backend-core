const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const Promise = require('bluebird');

const containerId = process.env.HOSTNAME;
let requestCount = 0;

class AuthController {

  static subscribe(req, res) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const subscribeStrategy = {
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

        const response = new StandardResponseWrapper(result,
          constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

        return res.status(constants.SYSTEM.ERROR_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        requestCount += 1;

        if (_err instanceof StandardErrorWrapper &&
            _err.getNthError(0).name === constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE) {
          const response = new StandardResponseWrapper([{ isSubscribed: true }], constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

          return res.status(constants.SYSTEM.ERROR_CODES.OK)
            .json(response.format);
        }

        const err = new StandardErrorWrapper(_err);

        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        });

        return res.status(constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR)
          .json(err.format({ containerId, requestCount }));
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

        const response = new StandardResponseWrapper(result, constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

        return res.status(constants.SYSTEM.ERROR_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        requestCount += 1;

        if (_err instanceof StandardErrorWrapper &&
            _err.getNthError(0).name === constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE) {
          const response = new StandardResponseWrapper([{ isSignedUp: true }], constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

          return res.status(constants.SYSTEM.ERROR_CODES.OK)
            .json(response);
        }

        const err = new StandardErrorWrapper(_err);

        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        });

        return res.status(constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR)
          .json(err.format({ containerId, requestCount }));

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
        let statusCode;
        let response;

        if (result && result.length) {
          statusCode = constants.SYSTEM.ERROR_CODES.OK;
          response = { isAuthenticated: true };
        } else {
          statusCode = constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED;
          response = { isAuthenticated: false };
        }
        const standardResponse = new StandardResponseWrapper([response], constants.SYSTEM.RESPONSE_NAMES.LOGIN);

        const standardResponse = new StandardResponseWrapper([response],
          constants.SYSTEM.RESPONSE_NAMES.LOGIN);

        requestCount += 1;

        return res.status(statusCode)
          .json(standardResponse.format);
      })
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

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = AuthController;
