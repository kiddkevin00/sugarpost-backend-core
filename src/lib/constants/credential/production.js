exports.JWT = {
  SECRET: 'my-jwt-secret',
  ISSUER: 'bulletin-board-system.herokuapp.com',
  AUDIENCE: '.sugarpost.com',
  EXPIRES_IN: '31 days',
  NOT_BEFORE: 0,
};

exports.STRIPE = {
  PRIVATE_KEY: 'sk_live_ypetQeGEadd6Qq5L6QIGkUn1',
  PLAN_ID: '4-desserts-per-month',
  QUANTITY: 1,
  RECURRING_BILLING_DATE: 26,
  REFERRAL_CREDIT: 272,
};

exports.MAIL_CHIMP = {
  API_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
  SIGNUP_LIST_ID: '3bbec150bd',
  SUBSCRIBED_LIST_ID: '67631ca231',
  CANCELLED_LIST_ID: 'c9afd3f1aa',
};
