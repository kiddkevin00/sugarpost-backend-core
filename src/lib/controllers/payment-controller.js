const DatabaseService = require('../services/database-service');
const ProcessSate = require('../process-state/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');
const stripeApi = require('stripe');
const couponCode = require('coupon-code');
const Promise = require('bluebird');

const privateKey = 'sk_test_ccdvoeJH9W86JXhx85PEgkvi'; // TODO
const stripe = stripeApi(privateKey);
const containerId = process.env.HOSTNAME;
let requestCount = 0;

class PaymentController {

  static proceed(req, res) {
    const email = req.body.token && req.body.token.email;
    const source = req.body.token && req.body.token.id;
    const referCode = req.body.referCode;
    const validatedReferCode = referCode && couponCode.validate(referCode, {
      parts: 1,
      partLen: 5,
    });
    let userId;
    let account_balance;
    let stripeCustomerId;

    const context = { containerId, requestCount };
    const state = ProcessSate.create({ email, referCode: validatedReferCode }, context);

    return Promise
      .try(() => {
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
        return null;
      })
      .then((result) => {
        if (result && (result.length === 1)) {
          account_balance = -200;

          stripe.customers.update(result[0].stripeCustomerId, { account_balance: -250 })
            .catch((_err) => {
              const err = new StandardErrorWrapper(_err);

              err.append({
                code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
                source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              });

              throw err;
            });
        } else {
          account_balance = 0;
        }

        const paymentCheckStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.SELECT,
            data: [
              { email },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return PaymentController._handleRequest(state, res, DatabaseService,
          paymentCheckStrategy);
      })
      .then((result) => {
        let err;

        if (!result || (result.length !== 1)) {
          err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.PAYMENT_CHECK_FAILURE,
              name: constants.STORE.ERROR_NAMES.EMAIL_NOT_FOUND,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.STORE.ERROR_MSG.EMAIL_NOT_FOUND,
            },
          ]);
        } else if (result[0].stripeCustomerId) {
          err = new StandardErrorWrapper([
            {
              code: constants.SYSTEM.ERROR_CODES.PAYMENT_CHECK_FAILURE,
              name: constants.STORE.ERROR_NAMES.ALREADY_LINK_TO_STRIPE_ACC,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.STORE.ERROR_MSG.ALREADY_LINK_TO_STRIPE_ACC,
            },
          ]);
        } else {
          userId = result[0]._id;
        }

        if (err) {
          err.append({
            code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
            source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          });

          throw err;
        }

        const description = `Customer for ${email}`;

        return stripe.customers.create({ source, email, description, account_balance });
      })
      .then((customer) => {
        stripeCustomerId = customer.id;

        const linkAccountStrategy = {
          storeType: constants.STORE.TYPES.MONGO_DB,
          operation: {
            type: constants.STORE.OPERATIONS.UPDATE,
            data: [
              { _id: userId },
              { stripeCustomerId },
            ],
          },
          tableName: constants.STORE.TABLE_NAMES.USER,
        };

        return PaymentController._handleRequest(state, res, DatabaseService, linkAccountStrategy);
      })
      .then((result) => {
        const items = [
          {
            plan: '4-desserts-per-month',
            quantity: 1,
          },
        ];
        const tax_percent = 10.0; // [TODO] This still need to be calculated carefully including Stripe fee and sales tax.
        const prorate = false;

        return stripe.subscriptions.create({
          items,
          tax_percent,
          prorate,
          customer: stripeCustomerId,
        });
      })
      .then((subscription) => {
        const id = subscription.id;
        const date = new Date(subscription.current_period_start * 1000);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const prorate = false;
        let trial_end;

        if (day <= 28) {
          trial_end = new Date(year, month + 1, 15).getTime() / 1000;
        } else {
          trial_end = new Date(year, month + 2, 15).getTime() / 1000;
        }

        return stripe.subscriptions.update(id, { trial_end, prorate });
      })
      .catch((_err) => {
        const err = new StandardErrorWrapper(_err);

        err.append({
          code: constants.SYSTEM.ERROR_CODES.INTERNAL_SERVER_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        });

        throw err;
      });

  }

  static _handleRequest(state, res, Svc, strategy) {
    return Promise.try(() => Svc.execute(state, strategy));
  }

}

module.exports = exports = PaymentController;
