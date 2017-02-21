const sources = {
  BULLETIN_BOARD_SYSTEM: 'bulletin-board-system',
};

const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

exports.SOURCES = sources;

exports.HTTP_STATUS_CODES = httpStatusCodes;

exports.ERROR_CODES = Object.assign({}, httpStatusCodes, {
  UNKNOWN_ERROR: 1000,
  CAUGHT_ERROR: 1001,
  DATABASE_OPERATION_ERROR: 1002,
  INVALID_RESPONSE_INTERFACE: 1003,
  TABLE_CONSTRAINT_VIOLATION: 1004,
  PAYMENT_CHECK_FAILURE: 1005,
});

exports.ERROR_NAMES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  CAUGHT_ERROR_IN_AUTH_CONTROLLER: 'CAUGHT_ERROR_IN_AUTH_CONTROLLER',
  CAUGHT_ERROR_IN_PAYMENT_CONTROLLER: 'CAUGHT_ERROR_IN_PAYMENT_CONTROLLER',
  RESPONSE_OBJ_PARSE_ERROR: 'RESPONSE_OBJ_PARSE_ERROR',
};

exports.ERROR_MSG = {
  CAUGHT_ERROR_IN_AUTH_CONTROLLER: 'There is an error being caught in Auth Controller.',
  CAUGHT_ERROR_IN_PAYMENT_CONTROLLER: 'There is an error being caught in Payment Controller.',
  RESPONSE_OBJ_PARSE_ERROR: 'The response object is not able to deserialize back to an instance of Standard Response Wrapper.',
};

exports.RESPONSE_NAMES = {
  SUBSCRIBE: 'SUBSCRIBE',
  SIGN_UP: 'SIGN_UP',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  AUTH_CHECK: 'AUTH_CHECK',
  PAYMENT: 'PAYMENT',
};

exports.COMMON = {
  CURRENT_SOURCE: sources.BULLETIN_BOARD_SYSTEM,
};

exports.DEFAULT_CONFIG = {

};
