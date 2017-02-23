const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const couponCode = require('coupon-code');
const nodemailer = require('nodemailer');

const jwtSecret = 'my-jwt-secret'; // [TODO]
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

    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const signupStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.INSERT,
        data: [
          {
            email: state.email,
            passwordHash: state.password, // [TODO] Should only store hashed password.
            fullName: state.fullName,
            emailValidated: false,
            suspended: false,
            version: 0,
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
        const jwtToken = jwt.sign({
          sub: 'test-type:test-email:test-id',
          _id: 'test-id',
          email: 'test-email',
          type: 'test-type',
          fullName: 'test-name',
        }, jwtSecret, {
          expiresIn: '45 days',
          notBefore: 0,
          issuer: 'bulletin-board-system.herokuapp.com',
          audience: '.sugarpost.com',
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
        }, constants.SYSTEM.RESPONSE_NAMES.SIGN_UP);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        if (err.getNthError(0).name === constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE) {
          const response = new StandardResponseWrapper([
            {
              success: false,
              status: err.getNthError(0).name,
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

    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
    const loginStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.SELECT,
        data: [
          {
            email: state.email,
            passwordHash: state.password, // [TODO] Should only verify hashed password.
          },
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };

    return AuthController._handleRequest(state, res, DatabaseService, loginStrategy)
      .then((result) => {
        let statusCode;
        let response;

        if (result && (result.length === 1)) {
          statusCode = constants.SYSTEM.HTTP_STATUS_CODES.OK;
          response = {
            success: true,
            detail: result[0],
          };

          const jwtToken = jwt.sign({
            sub: 'test-type:test-email:test-id',
            _id: 'test-id',
            email: 'test-email',
            type: 'test-type',
            fullName: 'test-name',
          }, jwtSecret, {
            expiresIn: '45 days',
            notBefore: 0,
            issuer: 'bulletin-board-system.herokuapp.com',
            audience: '.sugarpost.com',
          });

          res.cookie('jwt', jwtToken, {
            httpOnly: true,
            secure: false,
            path: '/api',
            signed: false,
          });
        } else {
          statusCode = constants.SYSTEM.HTTP_STATUS_CODES.OK;
          response = {
            success: false,
            detail: result,
          };
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

    const context = { containerId, requestCount };
    const state = ProcessSate.create(req.body, context);
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
        if (!result || (result.length !== 1)) {
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

        return AuthController._handleRequest(state, res, DatabaseService,
          updatePasswordStrategy);
      })
      .then((result) => {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'kingpong123321@gmail.com',
            pass: 'kingpong123',
          },
        });

        const mailOptions = {
          from: '"Sugarpost Test" <kingkong@kingpong.com>',
          to: 'kiddkevin01@gmail.com',
          subject: 'Sugarpost - Reset Password',
          html: `
            <div>
               <p>Dear customer,</p>
               <h4>Here is your new password ${newPassword}</h4>
               <p>Please follow the instruction below to change back to your preferred password.</p>
               <br />
               <p>Thank you,</p>
               <p>Sugarpost Support</p>
             </div>
          `,
        };

        transporter.sendMail(mailOptions, (_err, info) => {
          if (_err) {
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
          }
          // [TODO] Replace with logger module.
          return console.log('Message %s sent: %s', info.messageId, info.response);
        });

        const response = new StandardResponseWrapper({
          success: true,
          detail: result,
        }, constants.SYSTEM.RESPONSE_NAMES.FORGOT_PASSWORD);

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

  static getToken(req, res) {
    try {
      const jwtToken = jwt.sign({
        sub: 'test-type:test-email:test-id',
        _id: 'test-id',
        email: 'test-email',
        type: 'test-type',
        fullName: 'test-name',
      }, jwtSecret, {
        expiresIn: '2 days',
        notBefore: 0,
        issuer: 'bulletin-board-system.herokuapp.com',
        audience: '.sugarpost.com',
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
    const response = new StandardResponseWrapper([{ success: true }],
      constants.SYSTEM.RESPONSE_NAMES.AUTH_CHECK);

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
      .json(response.format);
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = AuthController;
