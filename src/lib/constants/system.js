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
  INVALID_RESPONSE_INTERFACE: 1000,
  TABLE_CONSTRAINT_VALIDATION: 1001,
});

exports.ERROR_NAMES = {
  RESPONSE_OBJ_PARSE_ERROR: 'RESPONSE_OBJ_PARSE_ERROR',
};

exports.ERROR_MSG = {
  RESPONSE_OBJ_PARSE_ERROR: 'The response object is not able to deserialize back to an instance of Standard Reponse Wrapper',
};

exports.RESPONSE_NAMES = {
  SUBSCRIBE: 'SUBSCRIBE',
  SIGN_UP: 'SIGN_UP',
  LOGIN: 'LOGIN',
  AUTH_CHECK: 'AUTH_CHECK',
};

exports.COMMON = {
  CURRENT_SOURCE: sources.BULLETIN_BOARD_SYSTEM,
};

exports.DEFAULT_CONFIG = {

};
