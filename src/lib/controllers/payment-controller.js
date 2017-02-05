const stripeApi = require('stripe');

const privateKey = 'sk_test_ccdvoeJH9W86JXhx85PEgkvi'; // TODO
const stripe = stripeApi(privateKey);

class PaymentController {

  static proceed(req, res) {
    const referCode = req.body.referCode;
    const source = req.body.token && req.body.token.id;
    const email = req.body.token && req.body.token.email;
    const description = `Customer for ${email}`;
    let account_balance;

    // [TODO] Check if the refer code is valid. If valid, also set referer's account balance to -250
    if (referCode === '123') {
      account_balance = -200;
    } else {
      account_balance = 0;
    }

    return stripe.customers.create({ source, email, description, account_balance })
      .then((customerObj) => {
        const customer = customerObj.id;
        const items = [
          {
            plan: '4-desserts-per-month',
            quantity: 1,
          },
        ];
        const tax_percent = 10.0; // This should include Stripe fee and sales tax.
        const prorate = false;

        return stripe.subscriptions.create({ customer, items, tax_percent, prorate });
      })
      .then((subscription) => {
        const id = subscription.id;
        const date = new Date(subscription.current_period_start * 1000)
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
      .catch((err) => {
        console.log(JSON.stringify(err, null, 2));
      });
  }

}

module.exports = exports = PaymentController;
