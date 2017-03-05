const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');
const stripeApi = require('stripe');
const Mailchimp = require('mailchimp-api-v3');
const couponCode = require('coupon-code');
const Promise = require('bluebird');

const stripe = stripeApi(constants.CREDENTIAL.STRIPE.PRIVATE_KEY);
const stripePlan = constants.CREDENTIAL.STRIPE.PLAN_ID;
const stripeQuantity = constants.CREDENTIAL.STRIPE.QUANTITY;
const stripeRecurringBillingDate = constants.CREDENTIAL.STRIPE.RECURRING_BILLING_DATE;
const stripeReferralCredit = constants.CREDENTIAL.STRIPE.REFERRAL_CREDIT;
const stripeRefererCredit = constants.CREDENTIAL.STRIPE.REFERER_CREDIT;
const mailchimp = new Mailchimp(constants.CREDENTIAL.MAIL_CHIMP.API_KEY);
const mailChimpListId = constants.CREDENTIAL.MAIL_CHIMP.LIST_ID;
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class PaymentController {

  static proceed(req, res) {
    requestCount += 1;

    const email = req.body.email;
    const referCode = req.body.referCode;
    const source = req.body.tokenId;
    let userId;
    let userFullName;
    let account_balance; // eslint-disable-line camelcase
    let stripeCustomerId;

    const context = { containerId, requestCount };
    const state = ProcessSate.create({ email, referCode, source }, context);

    return Promise
      .try(() => {
        const validatedReferCode = state.referCode &&
          couponCode.validate(state.referCode, { parts: 1, partLen: 5 });

        if (validatedReferCode) {
          const referCodeStrategy = {
            storeType: constants.STORE.TYPES.MONGO_DB,
            operation: {
              type: constants.STORE.OPERATIONS.SELECT,
              data: [
                {
                  referCode: validatedReferCode,
                },
              ],
            },
            tableName: constants.STORE.TABLE_NAMES.USER,
          };

          return PaymentController._handleRequest(state, res, DatabaseService, referCodeStrategy);
        }
        return {
          withoutReferCode: !state.referCode ||
            (typeof state.referCode === 'string' && state.referCode.trim().length === 0),
        };
      })
      .then((result) => {
        if (result && result.length === 1 && result[0].stripeCustomerId) {
          account_balance = -stripeReferralCredit; // eslint-disable-line camelcase

          stripe.customers
            .update(result[0].stripeCustomerId, { account_balance: -stripeRefererCredit })
            .catch((_err) => {
              const err = new StandardErrorWrapper(_err);

              err.append({
                code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
                name: constants.SYSTEM.ERROR_NAMES.CAUGHT_ERROR_IN_PAYMENT_CONTROLLER,
                source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
                message: constants.SYSTEM.ERROR_MSG.CAUGHT_ERROR_IN_PAYMENT_CONTROLLER,
              });

              return res.status(constants.SYSTEM.HTTP_STATUS_CODES.BAD_REQUEST)
                .json(err.format({
                  containerId: state.context.containerId,
                  requestCount: state.context.requestCount,
                }));
            });
        } else if (result.withoutReferCode) {
          account_balance = 0; // eslint-disable-line camelcase
        } else {
          const err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.BAD_REQUEST,
              name: constants.AUTH.ERROR_NAMES.REFER_CODE_NOT_FOUND,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.AUTH.ERROR_MSG.REFER_CODE_NOT_FOUND,
            },
          ]);

          throw err;
        }

        const paymentCheckStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.SELECT,
            data: [
              { email: state.email },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return PaymentController._handleRequest(state, res, DatabaseService, paymentCheckStrategy);
      })
      .then((result) => {
        let err;

        if (!result || (result.length !== 1)) {
          err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.PAYMENT_CHECK_FAILURE,
              name: constants.AUTH.ERROR_NAMES.PAYER_EMAIL_NOT_FOUND,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.AUTH.ERROR_MSG.PAYER_EMAIL_NOT_FOUND,
            },
          ]);

          throw err;
        } else if (result[0].stripeCustomerId) {
          err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.PAYMENT_CHECK_FAILURE,
              name: constants.AUTH.ERROR_NAMES.ALREADY_LINK_TO_STRIPE_ACC,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.AUTH.ERROR_MSG.ALREADY_LINK_TO_STRIPE_ACC,
            },
          ]);

          throw err;
        } else {
          userId = result[0]._id;
          userFullName = result[0].fullName;
        }

        const description = `Customer for ${userFullName} - ${userId}`;

        // eslint-disable-next-line camelcase
        return stripe.customers
          .create({ description, account_balance, email: state.email, source: state.source });
      })
      .then((customer) => {
        stripeCustomerId = customer.id;

        const myReferCode = couponCode.generate({
          parts: 1,
          partLen: 5,
        });
        const type = constants.AUTH.USER_TYPES.PAID;
        const linkAccountStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.UPDATE,
            data: [
              { _id: userId },
              { stripeCustomerId, type, referCode: myReferCode },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return PaymentController._handleRequest(state, res, DatabaseService, linkAccountStrategy);
      })
      .then((result) => {
        const items = [
          { stripePlan, stripeQuantity },
        ];
        const tax_percent = 8.875; // eslint-disable-line camelcase
        const prorate = false;

        return stripe.subscriptions
          .create({ items, tax_percent, prorate, customer: stripeCustomerId });
      })
      .then((subscription) => {
        const id = subscription.id;
        const date = new Date(subscription.current_period_start * 1000);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const prorate = false;
        let trial_end; // eslint-disable-line camelcase

        // [TODO] Need to consider the variant of February.
        if (day <= stripeRecurringBillingDate + 1) {
          // eslint-disable-next-line camelcase
          trial_end = new Date(year, month + 1, stripeRecurringBillingDate).getTime() / 1000;
        } else {
          // eslint-disable-next-line camelcase
          trial_end = new Date(year, month + 2, stripeRecurringBillingDate).getTime() / 1000;
        }

        // eslint-disable-next-line camelcase
        return stripe.subscriptions.update(id, { trial_end, prorate });
      })
      .then(() => mailchimp.post({
        path: `/lists/${mailChimpListId}/members/`,
        body: {
          email_address: state.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: userFullName,
          },
        },
      }))
      .then(() => {
        const response = new StandardResponseWrapper([{ success: true }],
          constants.SYSTEM.RESPONSE_NAMES.PAYMENT);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        if (
          err.getNthError(0).name === constants.AUTH.ERROR_NAMES.REFER_CODE_NOT_FOUND ||
          err.getNthError(0).name === constants.AUTH.ERROR_NAMES.PAYER_EMAIL_NOT_FOUND ||
          err.getNthError(0).name === constants.AUTH.ERROR_NAMES.ALREADY_LINK_TO_STRIPE_ACC
        ) {
          const response = new StandardResponseWrapper([
            {
              success: false,
              status: err.getNthError(0).name,
              detail: err.format({
                containerId: state.context.containerId,
                requestCount: state.context.requestCount,
              }),
            },
          ], constants.SYSTEM.RESPONSE_NAMES.PAYMENT);

          return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
            .json(response.format);
        }

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

module.exports = exports = PaymentController;
