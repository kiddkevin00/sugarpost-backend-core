exports.ERROR_NAMES = {
  JWT_INVALID: 'JWT_INVALID',
  JWT_NOT_AUTHORIZED: 'JWT_NOT_AUTHORIZED',
  JWT_GENERATION_ERROR: 'JWT_GENERATION_ERROR',
  PAYER_EMAIL_NOT_FOUND: 'PAYER_EMAIL_NOT_EXISTED',
  EMAIL_NOT_FOUND: 'EMAIL_NOT_EXISTED',
  ALREADY_LINK_TO_STRIPE_ACC: 'ALREADY_LINK_TO_STRIPE_ACC',
  REFER_CODE_NOT_FOUND: 'REFER_CODE_NOT_FOUND',
};

exports.ERROR_MSG = {
  JWT_INVALID: 'The provided JWT is invalid.',
  JWT_NOT_AUTHORIZED: 'The provided JWT identity is not authorized to access the resource.',
  JWT_GENERATION_ERROR: 'Something went wrong while generating JWT token.',
  PAYER_EMAIL_NOT_FOUND: 'The email associated with the payment is not found.',
  EMAIL_NOT_FOUND: 'The provided email is not found in database.',
  ALREADY_LINK_TO_STRIPE_ACC: 'The provided user has already linked to Stripe account.',
  REFER_CODE_NOT_FOUND: 'The provided refer code is not found in database.',
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
