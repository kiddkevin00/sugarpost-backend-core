exports.JWT = {
  SECRET: '80026A186D8328ADF0D929DE1F5C060E5A4A217080E749722883C0366049FEEA',
  ISSUER: 'bulletin-board-system.herokuapp.com',
  AUDIENCE: '.mysugarpost.com',
  EXPIRES_IN: '31 days',
  NOT_BEFORE: 0,

  COOKIE_NAME: 'jwt',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SECURE: true,
  COOKIE_PATH: '/api',
  COOKIE_SIGNED: false,
};

exports.STRIPE = {
  PRIVATE_KEY: 'sk_live_ypetQeGEadd6Qq5L6QIGkUn1',
  PLAN_ID: '2-desserts-per-month',
  QUANTITY: 1,
  RECURRING_BILLING_DATE: 26,
  REFERRAL_CREDIT: 680,
};

exports.MAIL_CHIMP = {
  API_KEY: 'f31c50146c261234d79265791a60aa2c-us15',
  SIGNUP_LIST_ID: '3bbec150bd',
  SUBSCRIBED_LIST_ID: '67631ca231',
  CANCELLED_LIST_ID: 'c9afd3f1aa',
};
