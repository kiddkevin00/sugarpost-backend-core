const DatabaseService = require('../services/database.service');
const ProcessSate = require('../process-state/');
const EmailSender = require('../utils/email-sender');
const Validator = require('../utils/precondition-validator');
const StandardResponseWrapper = require('../utils/standard-response-wrapper');
const StandardErrorWrapper = require('../utils/standard-error-wrapper');
const constants = require('../constants/');
const stripeApi = require('stripe');
const jwt = require('jsonwebtoken');
const mongojs = require('mongojs');
const Promise = require('bluebird');


const stripe = stripeApi(constants.CREDENTIAL.STRIPE.PRIVATE_KEY);
const stripeRecurringBillingDate = constants.CREDENTIAL.STRIPE.RECURRING_BILLING_DATE;
const jwtSecret = constants.CREDENTIAL.JWT.SECRET;
const jwtAudience = constants.CREDENTIAL.JWT.AUDIENCE;
const jwtIssuer = constants.CREDENTIAL.JWT.ISSUER;
const jwtExpiresIn = constants.CREDENTIAL.JWT.EXPIRES_IN;
const jwtNotBefore = constants.CREDENTIAL.JWT.NOT_BEFORE;
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class ReferralController {

  static redeemCredits(req, res) {
    requestCount += 1;

    const options = {
      _id: req.user._id,
      stripeSubscriptionId: req.user.stripeSubscriptionId,
    };
    const context = { containerId, requestCount };
    const state = ProcessSate.create(options, context);
    const redeemStrategy = {
      storeType: constants.STORE.TYPES.MONGO_DB,
      operation: {
        type: constants.STORE.OPERATIONS.UPDATE,
        data: [
          {
            _id: mongojs.ObjectId(state._id),
            referralAmount: { $gte: 10 },
          },
          { $inc: { referralAmount: -10 } },
          true,
        ],
      },
      tableName: constants.STORE.TABLE_NAMES.USER,
    };
    let dbResult;
    let isRedemmable;

    return ReferralController._handleRequest(state, res, DatabaseService, redeemStrategy)
      .then((result) => {
        dbResult = result;
        isRedemmable = dbResult.nModified === 1;

        if (isRedemmable) {
          return stripe.subscriptions.retrieve(state.stripeSubscriptionId);
        }
        return Promise.resolve();
      })
      .then((subscription) => {
        if (isRedemmable) {
          const date = new Date(subscription.trial_end * 1000);
          const month = date.getMonth();
          const year = date.getFullYear();
          const prorate = false;
          // eslint-disable-next-line camelcase
          const trial_end = new Date(year, month + 1, stripeRecurringBillingDate).getTime() / 1000;

          // eslint-disable-next-line camelcase
          return stripe.subscriptions.update(state.stripeSubscriptionId, { trial_end, prorate });
        }
        return Promise.resolve();
      })
      .then(() => {
        let response;

        if (isRedemmable) {
          const newReferralAmount = req.user.referralAmount - 10;

          response = new StandardResponseWrapper({
            success: true,
            detail: {
              referralAmount: newReferralAmount,
            },
          }, constants.SYSTEM.RESPONSE_NAMES.REDEEM_CREDITS);

          const newJwtPayload = Object.assign({}, req.user, { referralAmount: newReferralAmount });
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
            detail: dbResult,
          }, constants.SYSTEM.RESPONSE_NAMES.REDEEM_CREDITS);
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

  static sendEmail(req, res) {
    requestCount += 1;

    const emailTo = req.body.emailTo;
    const emailFromName = req.user.fullName;

    Validator.shouldNotBeEmpty(emailTo, constants.AUTH.ERROR_NAMES.EMAIL_TO_IS_EMPTY);
    Validator.shouldNotBeEmpty(emailFromName, constants.AUTH.ERROR_NAMES.EMAIL_FROM_NAME_IS_EMPTY);

    const emailSender = new EmailSender('Gmail', 'administrator@mysugarpost.com');
    const from = `"${emailFromName}" <administrator@mysugarpost.com>`;
    const to = emailTo;
    const subject = 'Enjoy Sugarpost with 50% Off Your First Month\'s Subscription';
    const referralCodeStr = req.user.referralCode || 'UNKNOWN';
    const html = `
      <div>
          <p>Hi,</p>
          <p>
            Here is a 50% discount off your first month of Sugarpost’s premium dessert
            subscription service! To claim your discount, sign up now and enter the
            following referral code in the payment page: ${referralCodeStr} or
            click the link below:
          </p>
          <p>https://www.mysugarpost.com/register/signup?refer_code=${referralCodeStr}</p>
          <br />
          <p>Enjoy your dessert,</p>
          <p>${emailFromName}</p>
       </div>
    `;

    return emailSender.sendMail(from, to, subject, html)
      .then((info) => {
        // [TODO] Replace with logger module.
        console.log('Referral email message %s sent: %s', info.messageId, info.response);

        const response = new StandardResponseWrapper([{ success: true }],
          constants.SYSTEM.RESPONSE_NAMES.EMAIL_REFERRAL);

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
          .json(err.format({ containerId, requestCount }));
      });
  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = ReferralController;
