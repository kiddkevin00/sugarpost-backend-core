const constants = require('../constants/');

class PreconditionValidator {

  static shouldNotBeEmpty(value, errCode) {
    if (Object.is(value, undefined) || Object.is(value, null) || Object.is(value, '')) {
      const err = {
        status: constants.SYSTEM.STATUS_CODES.BAD_REQUEST,
        code: errCode,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
      };

      throw err;
    }
    return PreconditionValidator;
  }

  static shouldBeEnumType(value, options, errCode) {
    if (options.indexOf(value) < 0) {
      const err = {
        status: constants.SYSTEM.STATUS_CODES.BAD_REQUEST,
        code: errCode,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
      };

      throw err;
    }
    return PreconditionValidator;
  }

  static shouldBeValidTime(value, errCode) {
    if (isNaN((new Date(value)).getTime())) {
      const err = {
        status: constants.SYSTEM.STATUS_CODES.BAD_REQUEST,
        code: errCode,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
      };

      throw err;
    }
    return PreconditionValidator;
  }

  static shouldBeArrayOrArrayText(input, errCode) {
    let array = input;

    if (typeof array === 'string') {
      try {
        array = JSON.parse(array);
      } catch (_err) {
        const err = {
          status: constants.SYSTEM.STATUS_CODES.BAD_REQUEST,
          code: errCode,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: _err,
        };

        throw err;
      }
    }

    if (!Array.isArray(array)) {
      const err = {
        status: constants.SYSTEM.STATUS_CODES.BAD_REQUEST,
        code: errCode,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
      };

      throw err;
    }

    for (const element of array) {
      PreconditionValidator.shouldNotBeEmpty(element);
    }

    return PreconditionValidator;
  }

}

module.exports = exports = PreconditionValidator;
