const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const EmailSender = require('../utility/email-sender');
const Validator = require('../utility/precondition-validator');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const couponCode = require('coupon-code');
const Mailchimp = require('mailchimp-api-v3');

const mailchimp = new Mailchimp(constants.CREDENTIAL.MAIL_CHIMP.API_KEY);
const mailChimpListId = constants.CREDENTIAL.MAIL_CHIMP.SIGNUP_LIST_ID;
const jwtSecret = constants.CREDENTIAL.JWT.SECRET;
const jwtAudience = constants.CREDENTIAL.JWT.AUDIENCE;
const jwtIssuer = constants.CREDENTIAL.JWT.ISSUER;
const jwtExpiresIn = constants.CREDENTIAL.JWT.EXPIRES_IN;
const jwtNotBefore = constants.CREDENTIAL.JWT.NOT_BEFORE;
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class AuthController {

  // Will be deprecated.
  static subscribe(req, res) {
    requestCount += 1;

    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const subscribeStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
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
        const response = new StandardResponseWrapper(result,
          constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        if (
          _err instanceof StandardErrorWrapper &&
          _err.getNthError(0).name === constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE
        ) {
          const response = new StandardResponseWrapper([{ isSubscribed: true }],
            constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

          return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
            .json(response.format);
        }

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

  static signup(req, res) {
    requestCount += 1;

    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    Validator.shouldNotBeEmpty(fullName, constants.AUTH.FULL_NAME_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(email, constants.AUTH.EMAIL_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.PASSWORD_FIELD_IS_EMPTY);

    const options = {
      fullName: fullName.trim(),
      email: email.trim() && email.toLowerCase(),
      password: password.trim(),
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const signupCheckStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          { email: state.email },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return AuthController._handleRequest(state, res, DatabaseService, signupCheckStrategy)
      .then((result) => {
        if (Array.isArray(result) && result.length === 1) {
          const err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.BAD_REQUEST,
              name: constants.AUTH.ERROR_NAMES.EMAIL_ALREADY_SIGNUP,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.AUTH.ERROR_MSG.EMAIL_ALREADY_SIGNUP,
            },
          ]);

          throw err;
        }

        return mailchimp
          .post({
            path: `/lists/${mailChimpListId}/members/`,
            body: {
              email_address: state.email,
              status: 'pending',
              merge_fields: {
                FNAME: state.fullName,
              },
            },
          });
      })
      .then(() => {
        const signupStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.INSERT,
            data: [
              {
                type: constants.AUTH.USER_TYPES.UNPAID,
                email: state.email,
                passwordHash: state.password, // [TODO] Should store hashed password instead.
                fullName: state.fullName,
                isSuspended: false,
                referralAmount: 0,
                version: 0,
                systemData: {
                  dateCreated: new Date(),
                  createdBy: null,
                  lastModifiedDate: null,
                  lastModifiedBy: null,
                },
              },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return AuthController._handleRequest(state, res, DatabaseService, signupStrategy);
      })
      .then((result) => {
        const jwtToken = jwt.sign({
          sub: `${result.type}:${result.email}:${result._id}`,
          _id: result._id,
          type: result.type,
          email: result.email,
          fullName: result.fullName,
          referralAmount: result.referralAmount,
        }, jwtSecret, {
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
          detail: result, // [TODO] Filters unneeded fields.
        }, constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        if (
          (err.getNthError(0).detail && err.getNthError(0).detail.title === 'Member Exists') ||
          err.getNthError(0).name === constants.AUTH.ERROR_NAMES.EMAIL_ALREADY_SIGNUP
        ) {
          const response = new StandardResponseWrapper([
            {
              success: false,
              status: constants.AUTH.ERROR_NAMES.EMAIL_ALREADY_SIGNUP,
              detail: err.format({
                containerId: state.context.containerId,
                requestCount: state.context.requestCount,
              }),
            },
          ], constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

          return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
            .json(response.format);
        }

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

  static login(req, res) {
    requestCount += 1;

    const email = req.body.email;
    const password = req.body.password;

    Validator.shouldNotBeEmpty(email, constants.AUTH.EMAIL_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.PASSWORD_FIELD_IS_EMPTY);

    const options = {
      email: email.trim() && req.body.email.toLowerCase(),
      password: password.trim(),
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const loginStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          {
            email: state.email,
            passwordHash: state.password, // [TODO] Should only verify hashed password.
            isSuspended: false,
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return AuthController._handleRequest(state, res, DatabaseService, loginStrategy)
      .then((result) => {
        let response;
        let statusCode;

        if (Array.isArray(result) && (result.length === 1)) {
          const user = result[0];

          delete user.passwordHash;
          delete user.isSuspended;
          delete user.version;
          delete user.systemData;

          response = {
            success: true,
            detail: user,
          };
          statusCode = constants.SYSTEM.HTTP_STATUS_CODES.OK;

          const jwtPayload = Object.assign({}, user, {
            sub: `${user.type}:${user.email}:${user._id}`,
          });
          const jwtToken = jwt.sign(jwtPayload, jwtSecret, {
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
        } else {
          response = {
            success: false,
            detail: result,
          };
          statusCode = constants.SYSTEM.HTTP_STATUS_CODES.OK;
        }
        const standardResponse = new StandardResponseWrapper([response],
          constants.SYSTEM.RESPONSE_NAMES.LOGIN);

        return res.status(statusCode)
          .json(standardResponse.format);
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

  static logout(req, res) {
    requestCount += 1;

    const response = new StandardResponseWrapper([{ success: true }],
      constants.SYSTEM.RESPONSE_NAMES.LOGOUT);

    res.cookie('jwt', '', {
      httpOnly: true,
      secure: false,
      path: '/api',
      signed: false,
    });

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
      .json(response.format);
  }

  static forgotPassword(req, res) {
    requestCount += 1;

    const email = req.body.email;

    Validator.shouldNotBeEmpty(email, constants.AUTH.EMAIL_FIELD_IS_EMPTY);

    const options = {
      email: email.trim() && email.toLowerCase(),
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const forgotPasswordStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          { email: state.email },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };
    let newPassword;

    return AuthController._handleRequest(state, res, DatabaseService, forgotPasswordStrategy)
      .then((result) => {
        if (!Array.isArray(result) || (result.length !== 1)) {
          const err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.BAD_REQUEST,
              name: constants.AUTH.ERROR_NAMES.USER_EMAIL_NOT_FOUND,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.AUTH.ERROR_MSG.USER_EMAIL_NOT_FOUND,
            },
          ]);

          throw err;
        }

        newPassword = couponCode.generate({
          parts: 1,
          partLen: 8,
        });

        const emailSender = new EmailSender('Gmail', 'administrator@mysugarpost.com');
        const from = '"Sugarpost Team" <administrator@mysugarpost.com>';
        const to = state.email;
        const subject = '[Sugarpost] Reset Password';
        const html = `
          <div>
             <p>Dear ${result[0].fullName},</p>
             <h4>Here is your new password ${newPassword}</h4>
             <p>Please follow the instruction below to change back to your preferred password.</p>
             <br />
             <p>Thank you,</p>
             <p>Sugarpost Support</p>
           </div>
        `;

        return emailSender.sendMail(from, to, subject, html);
      })
      .then((info) => {
        // [TODO] Replace with logger module.
        console.log('Forgot-password email message %s sent: %s', info.messageId, info.response);

        const updatePasswordStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.UPDATE,
            data: [
              { email: state.email },
              { passwordHash: newPassword },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return AuthController._handleRequest(state, res, DatabaseService, updatePasswordStrategy);
      })
      .then((result) => {
        const response = new StandardResponseWrapper({
          success: true,
          detail: result,
        }, constants.SYSTEM.RESPONSE_NAMES.FORGOT_PASSWORD);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        if (err.getNthError(0).name === constants.AUTH.ERROR_NAMES.USER_EMAIL_NOT_FOUND) {
          const response = new StandardResponseWrapper([
            {
              success: false,
              status: err.getNthError(0).name,
              detail: err.format({
                containerId: state.context.containerId,
                requestCount: state.context.requestCount,
              }),
            },
          ], constants.SYSTEM.RESPONSE_NAMES.FORGOT_PASSWORD);

          return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
            .json(response.format);
        }

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

  static getToken(req, res) {
    requestCount += 1;

    try {
      const jwtToken = jwt.sign({
        sub: 'test-type:test@mysugarpost.com:test-id',
        _id: 'test-id',
        email: 'test@mysugarpost.com',
        type: 'test-type',
        fullName: 'test-full-name',
      }, jwtSecret, {
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

      return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
        .json(jwtToken);
    } catch (_err) {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED,
          name: constants.AUTH.ERROR_NAMES.JWT_GENERATION_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.AUTH.ERROR_MSG.JWT_GENERATION_ERROR,
          detail: _err,
        },
      ]);

      return res.status(constants.SYSTEM.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(err.format({ containerId, requestCount }));
    }
  }

  static passAuthCheck(req, res) {
    requestCount += 1;

    const response = new StandardResponseWrapper([{
      success: true,
      detail: req.user,
    }], constants.SYSTEM.RESPONSE_NAMES.AUTH_CHECK);

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
      .json(response.format);
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = AuthController;
