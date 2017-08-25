exports.JWT = {
  SECRET: 'test-jwt-secret',
  ISSUER: 'bulletin-board-system-staging.herokuapp.com',
  AUDIENCE: 'mysugarpost-staging.herokuapp.com',
  EXPIRES_IN: '365 days',
  NOT_BEFORE: 0,

  COOKIE_NAME: 'jwt',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SECURE: false,
  COOKIE_PATH: '/api',
  COOKIE_SIGNED: false,
};

exports.STRIPE = {
  PRIVATE_KEY: 'sk_test_ccdvoeJH9W86JXhx85PEgkvi',
  PLAN_ID: '2-desserts-per-month',
  QUANTITY: 1,
  RECURRING_BILLING_DATE: 25,
  REFERRAL_CREDIT: 680,
};

exports.MAIL_CHIMP = {
  API_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
  SIGNUP_LIST_ID: '3bbec150bd',
  SUBSCRIBED_LIST_ID: '67631ca231',
  CANCELLED_LIST_ID: 'c9afd3f1aa',
};
