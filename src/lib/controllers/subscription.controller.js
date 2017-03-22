const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const Validator = require('../utility/precondition-validator');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const stripeApi = require('stripe');
const Mailchimp = require('mailchimp-api-v3');
const md5 = require('blueimp-md5');
const jwt = require('jsonwebtoken');
const mongojs = require('mongojs');
const Promise = require('bluebird');

const stripe = stripeApi(constants.CREDENTIAL.STRIPE.PRIVATE_KEY);
const mailchimp = new Mailchimp(constants.CREDENTIAL.MAIL_CHIMP.API_KEY);
const mailChimpListId = constants.CREDENTIAL.MAIL_CHIMP.SUBSCRIBED_LIST_ID;
const jwtSecret = constants.CREDENTIAL.JWT.SECRET;
const jwtAudience = constants.CREDENTIAL.JWT.AUDIENCE;
const jwtIssuer = constants.CREDENTIAL.JWT.ISSUER;
const jwtExpiresIn = constants.CREDENTIAL.JWT.EXPIRES_IN;
const jwtNotBefore = constants.CREDENTIAL.JWT.NOT_BEFORE;
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class SubscriptionController {

  static unsubscribe(req, res) {
    requestCount += 1;

    const options = {
      _id: req.user._id,
      email: req.user.email,
      stripeSubscriptionId: req.user.stripeSubscriptionId,
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);

    return mailchimp
      .patch({
        path: '/lists/{mailChimpListId}/members/{hashedEmail}',
        path_params: {
          mailChimpListId,
          hashedEmail: md5(state.email),
        },
        body: {
          status: 'unsubscribed',
        },
      })
      .then(() => stripe.subscriptions.del(state.stripeSubscriptionId, { at_period_end: true }))
      .then(() => {
        const updateProfileStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.UPDATE,
            data: [
              { _id: mongojs.ObjectId(state._id) },
              {
                type: constants.AUTH.USER_TYPES.CANCELLED,
              },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return SubscriptionController
          ._handleRequest(state, res, DatabaseService, updateProfileStrategy);
      })
      .then(() => {
        const newJwtPayload = Object.assign({}, req.user,  {
          sub: `${constants.AUTH.USER_TYPES.CANCELLED}:${req.user.email}:${req.user._id}`,
          type: constants.AUTH.USER_TYPES.CANCELLED,
        });
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

        const response = new StandardResponseWrapper([{ success: true }],
          constants.SYSTEM.RESPONSE_NAMES.PAYMENT);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          name: constants.SYSTEM.ERROR_NAMES.CAUGHT_ERROR_IN_PAYMENT_CONTROLLER,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.SYSTEM.ERROR_MSG.CAUGHT_ERROR_IN_PAYMENT_CONTROLLER,
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

module.exports = exports = SubscriptionController;
