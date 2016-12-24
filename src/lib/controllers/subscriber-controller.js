const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

class SubscriberController {

  static index(req, res) {
    if (req.user.type !== 'test-type') {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.ERROR_CODES.FORBIDDEN,
          name: constants.AUTH.ERROR_NAMES.JWT_NOT_AUTHORIZED,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.AUTH.ERROR_MSG.JWT_NOT_AUTHORIZED,
        },
      ]);

      return res.status(401)
        .json(err.format());
    }

    return res.status(200)
      .json(req.user);
  }

}

module.exports = exports = SubscriberController;
