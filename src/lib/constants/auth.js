exports.ERROR_NAMES = {
  JWT_INVALID: 'JWT_INVALID',
  JWT_NOT_AUTHORIZED: 'JWT_NOT_AUTHORIZED',
};

exports.ERROR_MSG = {
  JWT_INVALID: 'The provided JWT is invalid.',
  JWT_NOT_AUTHORIZED: 'THe provided JWT identity is not authorized to access the resource.',
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
