const stripe = require('stripe')('sk_test_ccdvoeJH9W86JXhx85PEgkvi');

class PaymentController {

  static proceed(req, res) {
    const stripeToken = req.body.token;
    const amount = 1999;

    stripe.charges.create({
      amount,
      source: stripeToken.id,
      currency: 'usd',
    }, (err, charge) => {
      if (err) {
        console.log(err);
        res.send('error');
      } else {
        res.send('success');
      }
    });
  }

}

module.exports = exports = PaymentController;
