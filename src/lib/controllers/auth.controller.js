const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const EmailSender = require('../utils/email-sender');
const Validator = require('../utils/precondition-validator');
const StandardErrorWrapper = require('../utils/standard-error-wrapper');
const StandardResponseWrapper = require('../utils/standard-response-wrapper');
const constants = require('../constants/');
const jwt = require('jsonwebtoken');
const couponCode = require('coupon-code');
const Mailchimp = require('mailchimp-api-v3');
// const mongojs = require('mongojs');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');


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

  static signup(req, res) {
    requestCount += 1;

    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    Validator.shouldNotBeEmpty(fullName, constants.AUTH.ERROR_NAMES.FULL_NAME_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(email, constants.AUTH.ERROR_NAMES.EMAIL_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.ERROR_NAMES.PASSWORD_FIELD_IS_EMPTY);

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
        if (Array.isArray(result) && result.length >= 1) {
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

        return mailchimp.post({
          path: `/lists/${mailChimpListId}/members/`,
          body: {
            email_address: state.email,
            path_params: {
              mailChimpListId,
            },
            status: 'subscribed',
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
                type: constants.SYSTEM.USER_TYPES.UNPAID,
                email: state.email,
                passwordHash: state.password, // [TODO] Should store hashed password instead.
                fullName: state.fullName,
                isSuspended: false,
                referralAmount: 0,
                version: 0,
                systemData: {
                  dateCreated: new Date(),
                  createdBy: null,
                  dateLastModified: null,
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
        const user = result;
        const emailSender = new EmailSender('Gmail', 'administrator@mysugarpost.com');
        const from = '"Sugarpost Team" <administrator@mysugarpost.com>';
        const to = state.email;
        const subject = 'Welcome to Sugarpost';
        const html = fs.readFileSync(path.resolve(__dirname, '../views/welcome-email.html'),
          'utf8');

        emailSender.sendMail(from, to, subject, html)
          .then((info) => {
            // [TODO] Replace with logger module.
            console.log('Welcome email message ID - %s sent: %s', info.messageId, info.response);
          })
          .catch((_err) => {
            const err = new StandardErrorWrapper(_err);

            err.append({
              code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
              name: constants.SYSTEM.ERROR_NAMES.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.SYSTEM.ERROR_MSG.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
            });

            // [TODO] Replace with logger module.
            console.log('ERROR...', err);
          });

        delete user.passwordHash;
        delete user.isSuspended;
        delete user.version;
        delete user.systemData;

        const jwtPayload = Object.assign({}, user, {
          sub: `${user.type}:${user.email}:${user._id}`,
        });
        const jwtToken = jwt.sign(jwtPayload, jwtSecret, {
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

        const response = new StandardResponseWrapper({
          success: true,
          detail: user,
        }, constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        if (
          (err.getNthError(0).detail && err.getNthError(0).detail.title) === 'Member Exists' ||
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

    Validator.shouldNotBeEmpty(email, constants.AUTH.ERROR_NAMES.EMAIL_FIELD_IS_EMPTY);
    Validator.shouldNotBeEmpty(password, constants.AUTH.ERROR_NAMES.PASSWORD_FIELD_IS_EMPTY);

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

          res.cookie(constants.CREDENTIAL.JWT.COOKIE_NAME, jwtToken, {
            httpOnly: constants.CREDENTIAL.JWT.COOKIE_HTTP_ONLY,
            secure: constants.CREDENTIAL.JWT.COOKIE_SECURE,
            path: constants.CREDENTIAL.JWT.COOKIE_PATH,
            signed: constants.CREDENTIAL.JWT.COOKIE_SIGNED,
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

    res.cookie(constants.CREDENTIAL.JWT.COOKIE_NAME, '', {
      httpOnly: constants.CREDENTIAL.JWT.COOKIE_HTTP_ONLY,
      secure: constants.CREDENTIAL.JWT.COOKIE_SECURE,
      path: constants.CREDENTIAL.JWT.COOKIE_PATH,
      signed: constants.CREDENTIAL.JWT.COOKIE_SIGNED,
    });

    const response = new StandardResponseWrapper([{ success: true }],
      constants.SYSTEM.RESPONSE_NAMES.LOGOUT);

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
      .json(response.format);
  }

  static forgotPassword(req, res) {
    requestCount += 1;

    const email = req.body.email;

    Validator.shouldNotBeEmpty(email, constants.AUTH.ERROR_NAMES.EMAIL_FIELD_IS_EMPTY);

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
        const subject = 'How to reset your Sugarpost account\'s Password';
        const html = `
          <div>
              <p>Dear ${result[0].fullName},</p>
              <h4>Here is your new password ${newPassword}</h4>
              <p>Please follow the instructions below to change back to your preferred password.</p>
              <ol>
                  <li>
                    Visit https://www.mysugarpost.com/register/login
                  </li>
                  <li>
                    Enter the new password that you received in this email above and log in.
                  </li>
                  <li>
                    Under Account tab in Profile section, change your password to what you would
                    like your new password to be.
                  </li>
              </ol>
              <br />
              <p>Thank you,</p>
              <p>Sugarpost Support</p>
           </div>
        `;

        return emailSender.sendMail(from, to, subject, html);
      })
      .then((info) => {
        // [TODO] Replace with logger module.
        console.log('Forgot-password email message ID - %s sent: %s', info.messageId, info.response);

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
        const response = new StandardResponseWrapper([{ success: true, detail: result }],
          constants.SYSTEM.RESPONSE_NAMES.FORGOT_PASSWORD);

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

    // [TODO] HTTP request's query string should not be case sensitive for both key and value.
    try {
      const jwtPayload = Object.assign({}, req.query, {
        sub: `${req.query.type}:${req.query.email}:${req.query._id}`,
      });
      const jwtToken = jwt.sign(jwtPayload, jwtSecret, {
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

      return res.redirect(constants.SYSTEM.HTTP_STATUS_CODES.PERMANENT_REDIRECT,
        `${req.query.callback_url}`);
    } catch (_err) {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED,
          name: (_err && _err.name) || constants.AUTH.ERROR_NAMES.JWT_GENERATION_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: (_err && _err.message) || constants.AUTH.ERROR_MSG.JWT_GENERATION_ERROR,
          detail: _err,
        },
      ]);

      return res.status(constants.SYSTEM.HTTP_STATUS_CODES.UNAUTHENTICATED)
        .json(err.format({ containerId, requestCount }));
    }
  }

  static getUserInfo(req, res) {
    requestCount += 1;

    const response = new StandardResponseWrapper([{
      success: true,
      detail: req.user,
    }], constants.SYSTEM.RESPONSE_NAMES.AUTH_CHECK);

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
      .json(response.format);

    //const options = { _id: req.user._id };
    //const context = { containerId, requestCount };
    //const state = ProcessSate.create(options, context);
    //const getUserInfoStrategy = {
    //  storeType: constants.STORE.TYPES.MONGO_DB,
    //  operation: {
    //    type: constants.STORE.OPERATIONS.SELECT,
    //    data: [
    //      { _id: mongojs.ObjectId(state._id) },
    //    ],
    //  },
    //  tableName: constants.STORE.TABLE_NAMES.USER,
    //};
    //return AuthController._handleRequest(state, res, DatabaseService, getUserInfoStrategy)
    //  .then((result) => {
    //    const user = Array.isArray(result) ? result[0] : {};
    //    const jwtToken = jwt.sign(user, jwtSecret, {
    //      expiresIn: jwtExpiresIn,
    //      notBefore: jwtNotBefore,
    //      issuer: jwtIssuer,
    //      audience: jwtAudience,
    //    });
    //
    //    res.cookie(constants.CREDENTIAL.JWT.COOKIE_NAME, jwtToken, {
    //      httpOnly: constants.CREDENTIAL.JWT.COOKIE_HTTP_ONLY,
    //      secure: constants.CREDENTIAL.JWT.COOKIE_SECURE,
    //      path: constants.CREDENTIAL.JWT.COOKIE_PATH,
    //      signed: constants.CREDENTIAL.JWT.COOKIE_SIGNED,
    //    });
    //
    //    const response = new StandardResponseWrapper([{
    //      success: true,
    //      detail: user,
    //    }], constants.SYSTEM.RESPONSE_NAMES.AUTH_CHECK);
    //
    //    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
    //      .json(response.format);
    //  })
    //  .catch((_err) => {
    //    const err = new StandardErrorWrapper(_err);
    //
    //    err.append({
    //      code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
    //      name: constants.SYSTEM.ERROR_NAMES.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
    //      source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
    //      message: constants.SYSTEM.ERROR_MSG.CAUGHT_ERROR_IN_AUTH_CONTROLLER,
    //    });
    //
    //    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    //      .json(err.format({
    //        containerId: state.context.containerId,
    //        requestCount: state.context.requestCount,
    //      }));
    //  });
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = AuthController;
