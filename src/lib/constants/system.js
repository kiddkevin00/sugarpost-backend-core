const sources = {
  bulletinBoardSystem: 'bulletin-board-system',
};

exports.SOURCES = sources;

const statusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

exports.STATUS_CODES = statusCodes;

exports.ERROR_CODES = Object.assign(statusCodes, {
  TABLE_CONSTRAINT_VALIDATION: 1000,
});

exports.COMMON = {
  CURRENT_SOURCE: sources.bulletinBoardSystem,
};

exports.DEFAULT_CONFIG = {

};
