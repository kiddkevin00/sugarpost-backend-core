exports.JWT = {
  SECRET: 'my-jwt-secret',
  ISSUER: 'bulletin-board-system.herokuapp.com',
  AUDIENCE: '.sugarpost.com',
  EXPIRES_IN: '365 days',
  NOT_BEFORE: 0,
};

exports.STRIPE = {
  PRIVATE_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
};

exports.MAIL_CHIMP = {
  API_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
  LIST_ID: 'c298b7bb64',
  PLAN_ID: '4-desserts-per-month',
  QUANTITY: 1,
  RECURRING_BILLING_DATE: 24,
  REFERRAL_CREDIT: 206,
  REFERER_CREDIT: 250,
};
