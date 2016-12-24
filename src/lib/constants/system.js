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
  TABLE_CONSTRAINT_VALIDATION: 1000,
});

exports.RESPONSE_NAMES = {
  SUBSCRIBE: 'SUBSCRIBE',
  SIGN_UP: 'SIGN_UP',
  LOGIN: 'LOGIN',
};

exports.COMMON = {
  CURRENT_SOURCE: sources.BULLETIN_BOARD_SYSTEM,
};

exports.DEFAULT_CONFIG = {

};
