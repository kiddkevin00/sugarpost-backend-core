exports.JWT = {
  SECRET: 'my-jwt-secret',
  ISSUER: 'bulletin-board-system.herokuapp.com',
  AUDIENCE: '.sugarpost.com',
  EXPIRES_IN: '45 days',
  NOT_BEFORE: 0,
};

exports.STRIPE = {
  PRIVATE_KEY: 'sk_live_ypetQeGEadd6Qq5L6QIGkUn1',
  PLAN_ID: 'test-01',
  QUANTITY: 1,
  RECURRING_BILLING_DATE: 24,
  REFERRAL_CREDIT: 206,
};

exports.MAIL_CHIMP = {
  API_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
  SIGNUP_LIST_ID: 'bec7efbdcb',
  SUBSCRIBED_LIST_ID: '67631ca231',
  CANCELLED_LIST_ID: 'c9afd3f1aa',
};
