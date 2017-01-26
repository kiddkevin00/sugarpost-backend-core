const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants');
const jwt = require('jsonwebtoken');

const jwtSecret = 'my-jwt-secret'; // [TODO]

function authMiddleware(req, res, next) {
  const jwtToken = req.cookies.jwt;

  try {
    const decodedJwt = jwt.verify(jwtToken, jwtSecret, {
      issuer: 'bulletin-board-system.herokuapp.com',
      audience: '.sugarpost.com',
    });

    /* eslint-disable no-param-reassign */
    req.user = {
      _id: decodedJwt._id,
      email: decodedJwt.email,
      type: decodedJwt.type,
      firstName: decodedJwt.firstName,
      lastName: decodedJwt.lastName,
    };
    /* eslint-enable */

    return next();
  } catch (_err) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED,
        name: (_err && _err.name) || constants.AUTH.ERROR_NAMES.JWT_INVALID,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: (_err && _err.message) || constants.AUTH.ERROR_MSG.JWT_INVALID,
        detail: _err,
      },
    ]);

    return res.status(constants.SYSTEM.HTTP_STATUS_CODES.UNAUTHENTICATED)
      .json(err.format());
  }
}

module.exports = exports = authMiddleware;
