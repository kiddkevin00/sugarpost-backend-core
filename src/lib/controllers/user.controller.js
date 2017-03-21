const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const Validator = require('../utility/precondition-validator');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const jwt = require('jsonwebtoken');
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

    const email = req.user.email;
    const fullName = req.body.fullName;
    const password = req.body.password;

    Validator.shouldNotBeEmpty(email, constants.AUTH.EMAIL_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(fullName, constants.AUTH.FULL_NAME_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.PASSWORD_FIELD_IS_EMPTY);

    const options = {
      email: email.trim() && email.toLowerCase(),
      fullName: fullName && fullName.trim(),
      password: password && password.trim(),
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const updateProfileStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.UPDATE,
        data: [
          { email: state.email },
          {
            fullName: state.fullName,
            passwordHash: state.password },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return UserController._handleRequest(state, res, DatabaseService, updateProfileStrategy)
      .then((result) => {
        const newJwtPayload = Object.assign({}, req.user, { fullName: state.fullName });
        const jwtToken = jwt.sign(newJwtPayload, jwtSecret, {
          expiresIn: jwtExpiresIn,
          notBefore: jwtNotBefore,
          issuer: jwtIssuer,
          audience: jwtAudience,
        });

        res.cookie('jwt', jwtToken, {
          httpOnly: true,
          secure: false,
          path: '/api',
          signed: false,
        });

        const response = new StandardResponseWrapper({
          success: true,
          detail: result,
        }, constants.SYSTEM.RESPONSE_NAMES.UPDATE_PROFILE);

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
