exports.ERROR_NAMES = {
  JWT_INVALID: 'JWT_INVALID',
  JWT_NOT_AUTHORIZED: 'JWT_NOT_AUTHORIZED',
  JWT_GENERATION_ERROR: 'JWT_GENERATION_ERROR',
  EMAIL_ALREADY_SIGNUP: 'EMAIL_ALREADY_SIGNUP',
  PAYER_EMAIL_NOT_FOUND: 'PAYER_EMAIL_NOT_EXISTED',
  USER_EMAIL_NOT_FOUND: 'EMAIL_NOT_EXISTED',
  ALREADY_LINK_TO_STRIPE_ACC: 'ALREADY_LINK_TO_STRIPE_ACC',
  REFERRAL_CODE_NOT_FOUND: 'REFERRAL_CODE_NOT_FOUND',
  FULL_NAME_FIELD_IS_EMPTY: 'FULL_NAME_FIELD_IS_EMPTY',
  EMAIL_FIELD_IS_EMPTY: 'EMAIL_FIELD_IS_EMPTY',
  PASSWORD_FIELD_IS_EMPTY: 'PASSWORD_FIELD_IS_EMPTY',
};

exports.ERROR_MSG = {
  JWT_INVALID: 'The provided JWT is invalid.',
  JWT_NOT_AUTHORIZED: 'The provided JWT identity is not authorized to access the resource.',
  JWT_GENERATION_ERROR: 'Something went wrong while generating JWT token.',
  EMAIL_ALREADY_SIGNUP: 'The provided email is already signed up.',
  PAYER_EMAIL_NOT_FOUND: 'The email associated with the payment is not found.',
  USER_EMAIL_NOT_FOUND: 'The provided email is not found in database.',
  ALREADY_LINK_TO_STRIPE_ACC: 'The provided user has already linked to Stripe account.',
  REFERRAL_CODE_NOT_FOUND: 'The provided refer code is not found in database.',
};

exports.CORS = {
  WHITELIST: [
    'https://www.mysugarpost.com',
    'https://mysugarpost.herokuapp.com',
    'https://mysugarpost-staging.herokuapp.com',
    'http://127.0.0.1:8088',
    'http://0.0.0.0:8088',
    'http://localhost:8088',
  ],
};

exports.USER_TYPES = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};
