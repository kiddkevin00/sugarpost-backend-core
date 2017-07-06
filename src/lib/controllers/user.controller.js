const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const Validator = require('../utils/precondition-validator');
const StandardErrorWrapper = require('../utils/standard-error-wrapper');
const StandardResponseWrapper = require('../utils/standard-response-wrapper');
const constants = require('../constants/');
const jwt = require('jsonwebtoken');
const mongojs = require('mongojs');
const Promise = require('bluebird');


const jwtSecret = constants.CREDENTIAL.JWT.SECRET;
const jwtAudience = constants.CREDENTIAL.JWT.AUDIENCE;
const jwtIssuer = constants.CREDENTIAL.JWT.ISSUER;
const jwtExpiresIn = constants.CREDENTIAL.JWT.EXPIRES_IN;
const jwtNotBefore = constants.CREDENTIAL.JWT.NOT_BEFORE;
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class UserController {

  static updateUserInfo(req, res) {
    requestCount += 1;

    const _id = req.user._id;
    const fullName = req.body.fullName;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    Validator.shouldNotBeEmpty(fullName, constants.AUTH.FULL_NAME_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.PASSWORD_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(newPassword, constants.AUTH.PASSWORD_FIELD_IS_EMPTY);

    const options = {
      _id,
      fullName: fullName && fullName.trim(),
      password: password && password.trim(),
      newPassword: newPassword && newPassword.trim(),
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const updateProfileStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.UPDATE,
        data: [
          {
            _id: mongojs.ObjectId(state._id),
            passwordHash: state.password,
          },
          {
            fullName: state.fullName,
            passwordHash: state.newPassword,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return UserController._handleRequest(state, res, DatabaseService, updateProfileStrategy)
      .then((result) => {
        let response;

        if (result.n === 1) {
          response = new StandardResponseWrapper({
            success: true,
            detail: result,
          }, constants.SYSTEM.RESPONSE_NAMES.UPDATE_PROFILE);

          const newJwtPayload = Object.assign({}, req.user, { fullName: state.fullName });
          const jwtToken = jwt.sign(newJwtPayload, jwtSecret, {
            expiresIn: jwtExpiresIn,
            notBefore: jwtNotBefore,
            issuer: jwtIssuer,
            audience: jwtAudience,
          });

          res.cookie(constants.CREDENTIAL.JWT.COOKIE_NAME, jwtToken, {
            httpOnly: constants.CREDENTIAL.JWT.COOKIE_HTTP_ONLY,
            secure: constants.CREDENTIAL.JWT.COOKIE_SECURE,
            path: constants.CREDENTIAL.JWT.COOKIE_PATH,
            signed: constants.CREDENTIAL.JWT.COOKIE_SIGNED,
          });
        } else {
          response = new StandardResponseWrapper({
            success: false,
            detail: result,
          }, constants.SYSTEM.RESPONSE_NAMES.UPDATE_PROFILE);
        }

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          name: constants.SYSTEM.ERROR_NAMES.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.SYSTEM.ERROR_MSG.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
        });

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json(err.format({
            containerId: state.context.containerId,
            requestCount: state.context.requestCount,
          }));
      });
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = UserController;
