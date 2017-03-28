// BEGIN - THIS PART SHOULD BE CONSISTENT WITH FRONTEND

const sources = {
  BULLETIN_BOARD_SYSTEM: 'bulletin-board-system',
  SUGARPOST_WEB_FRONTEND: 'sugarpost-web-frontend',
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

exports.USER_TYPES = {
  UNPAID: 'Not Subscribed',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  VENDOR: 'Vendor',
  ADMIN: 'Admin',
  INFLUENCER: 'Influencer',
};

// END - THIS PART SHOULD BE CONSISTENT WITH FRONTEND

exports.COMMON = {
  CURRENT_SOURCE: sources.BULLETIN_BOARD_SYSTEM,
};

exports.DEFAULT_CONFIG = {};

// This is the only place aggregating all error codes.
exports.ERROR_CODES = Object.assign({}, httpStatusCodes, {
  UNKNOWN_ERROR: 1000,
  INVALID_RESPONSE_INTERFACE: 1001,
  INVALID_ERROR_INTERFACE: 1002,
  CAUGHT_ERROR: 1003,
  DATABASE_OPERATION_ERROR: 1004,
  TABLE_CONSTRAINT_VIOLATION: 1005,
  PAYMENT_CHECK_FAILURE: 1006,
});

exports.ERROR_NAMES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RESPONSE_OBJ_PARSE_ERROR: 'RESPONSE_OBJ_PARSE_ERROR',
  ERROR_OBJ_PARSE_ERROR: 'RESPONSE_OBJ_PARSE_ERROR',
  CAUGHT_ERROR_IN_AUTH_CONTROLLER: 'CAUGHT_ERROR_IN_AUTH_CONTROLLER',
  CAUGHT_ERROR_IN_PAYMENT_CONTROLLER: 'CAUGHT_ERROR_IN_PAYMENT_CONTROLLER',
};

exports.ERROR_MSG = {
  RESPONSE_OBJ_PARSE_ERROR: 'The response object is not able to deserialize back to an instance of Standard Response Wrapper.',
  ERROR_OBJ_PARSE_ERROR: 'The error object is not able to deserialize back to an instance of Standard Error Wrapper.',
  CAUGHT_ERROR_IN_AUTH_CONTROLLER: 'There is an error being caught in Auth Controller.',
  CAUGHT_ERROR_IN_PAYMENT_CONTROLLER: 'There is an error being caught in Payment Controller.',
};

exports.RESPONSE_NAMES = {
  SUBSCRIBE: 'SUBSCRIBE',
  SIGN_UP: 'SIGN_UP',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  EMAIL_REFERRAL: 'EMAIL_REFERRAL',
  AUTH_CHECK: 'AUTH_CHECK',
  PAYMENT: 'PAYMENT',
};
