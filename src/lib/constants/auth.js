exports.ERROR_NAMES = {
  JWT_INVALID: 'JWT_INVALID',
  JWT_NOT_AUTHORIZED: 'JWT_NOT_AUTHORIZED',
  JWT_GENERATION_ERROR: 'JWT_GENERATION_ERROR',
  EMAIL_ALREADY_SIGNUP: 'EMAIL_ALREADY_SIGNUP',
  USER_EMAIL_NOT_FOUND: 'EMAIL_NOT_EXISTED',
  ALREADY_PAID: 'ALREADY_PAID',
  NOT_ELIGIBLE_FOR_REFERRAL_DISCOUNT: 'NOT_ELIGIBLE_FOR_REFERRAL_DISCOUNT',
  REFERRAL_CODE_NOT_FOUND: 'REFERRAL_CODE_NOT_FOUND',
  FULL_NAME_FIELD_IS_EMPTY: 'FULL_NAME_FIELD_IS_EMPTY',
  EMAIL_FIELD_IS_EMPTY: 'EMAIL_FIELD_IS_EMPTY',
  PASSWORD_FIELD_IS_EMPTY: 'PASSWORD_FIELD_IS_EMPTY',
  EMAIL_TO_IS_EMPTY: 'EMAIL_TO_IS_EMPTY',
  EMAIL_FROM_NAME_IS_EMPTY: 'EMAIL_FROM_NAME_IS_EMPTY',
};

exports.ERROR_MSG = {
  JWT_INVALID: 'The provided JWT is invalid.',
  JWT_NOT_AUTHORIZED: 'The provided JWT identity is not authorized to access the resource.',
  JWT_GENERATION_ERROR: 'Something went wrong while generating JWT token.',
  EMAIL_ALREADY_SIGNUP: 'The provided email is already signed up.',
  USER_EMAIL_NOT_FOUND: 'The provided email is not found in database.',
  ALREADY_PAID: 'The provided user has already paid for the subscription.',
  NOT_ELIGIBLE_FOR_REFERRAL_DISCOUNT: 'The provided user had already paid for the subscription once.',
  REFERRAL_CODE_NOT_FOUND: 'The provided refer code is not found in database.',
};

exports.CORS = {
  WHITELIST: [
    'https://mysugarpost.com',
    'https://www.mysugarpost.com',
    'https://mysugarpost.herokuapp.com',
    'https://mysugarpost-staging.herokuapp.com',
    'http://0.0.0.0:8088',
    'http://127.0.0.1:8088',
    'http://localhost:8088',
  ],
};

