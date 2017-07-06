const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utils/standard-error-wrapper');
const StandardResponseWrapper = require('../utils/standard-response-wrapper');
const constants = require('../constants/');
const stripeApi = require('stripe');
const Mailchimp = require('mailchimp-api-v3');
const md5 = require('blueimp-md5');
const jwt = require('jsonwebtoken');
const mongojs = require('mongojs');
const Promise = require('bluebird');


const stripe = stripeApi(constants.CREDENTIAL.STRIPE.PRIVATE_KEY);
const mailchimp = new Mailchimp(constants.CREDENTIAL.MAIL_CHIMP.API_KEY);
const mailChimpSubscribedListId = constants.CREDENTIAL.MAIL_CHIMP.SUBSCRIBED_LIST_ID;
const mailChimpCancelledListId = constants.CREDENTIAL.MAIL_CHIMP.CANCELLED_LIST_ID;
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
      fullName: req.user.fullName,
      stripeSubscriptionId: req.user.stripeSubscriptionId,
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);

    if (req.user.type !== constants.SYSTEM.USER_TYPES.PAID) {
      const standardResponse = new StandardResponseWrapper([{ success: false }],
        constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

      return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
        .json(standardResponse.format);
    }

    return mailchimp
      .post({
        path: '/lists/{mailChimpCancelledListId}/members/',
        path_params: {
          mailChimpCancelledListId,
        },
        body: {
          email_address: state.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: state.fullName,
          },
        },
      })
      .then(() => mailchimp.delete({
        path: '/lists/{mailChimpSubscribedListId}/members/{hashedEmail}',
        path_params: {
          mailChimpSubscribedListId,
          hashedEmail: md5(state.email),
        },
      }))
      .then(() => stripe.subscriptions.del(state.stripeSubscriptionId, { at_period_end: true }))
      .then(() => {
        const updateProfileStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.UPDATE,
            data: [
              { _id: mongojs.ObjectId(state._id) },
              {
                type: constants.SYSTEM.USER_TYPES.CANCELLED,
              },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return SubscriptionController
          ._handleRequest(state, res, DatabaseService, updateProfileStrategy);
      })
      .then(() => {
        const newJwtPayload = Object.assign({}, req.user, {
          sub: `${constants.SYSTEM.USER_TYPES.CANCELLED}:${req.user.email}:${req.user._id}`,
          type: constants.SYSTEM.USER_TYPES.CANCELLED,
        });
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

        const response = new StandardResponseWrapper([{ success: true }],
          constants.SYSTEM.RESPONSE_NAMES.SUBSCRIBE);

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
