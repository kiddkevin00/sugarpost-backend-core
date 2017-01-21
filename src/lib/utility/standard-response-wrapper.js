/*
 * Standard response format (for 200 status code only):
 * ```
 * {
 *   result: {
 *     meta: { name: "INSERT" },
 *     data: [
 *       {
 *         field1: value1,
 *         field2: value2,
 *         field3: value3
 *        },
 *        {
 *         field1: value4,
 *         field2: value5,
 *         field3: value6
 *       }
 *     ]
 *   }
 * }
 * ```
 */

const StandardErrorWrapper = require('./standard-error-wrapper');
const constants = require('../constants/');

const responseContext = Symbol('response-context');

class StandardResponseWrapper {

  constructor(initialData, name) {
    this[responseContext] = {};

    if (Array.isArray(initialData)) {
      this[responseContext].data = initialData;
    } else if (initialData) {
      this[responseContext].data = [initialData];
    } else {
      this[responseContext].data = [];
    }

    this[responseContext].name = name;
  }

  append(newData) {
    this[responseContext].data.push(newData);
  }

  get name() {
    return this[responseContext].name;
  }

  get data() {
    return this[responseContext].data;
  }

  get format() {
    return {
      result: {
        meta: { name: this[responseContext].name },
        data: this[responseContext].data,
      },
    };
  }

  static deserialize(successPayloadObj) {
    const data = successPayloadObj.result && successPayloadObj.result.data;

    if (!Array.isArray(data)) {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.ERROR_CODES.INVALID_RESPONSE_INTERFACE,
          name: constants.SYSTEM.ERROR_NAMES.RESPONSE_OBJ_PARSE_ERROR,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.SYSTEM.ERROR_MSG.RESPONSE_OBJ_PARSE_ERROR,
        },
      ]);

      throw err;
    }
    return new StandardResponseWrapper(successPayloadObj.result.data);
  }

}

module.exports = exports = StandardResponseWrapper;
