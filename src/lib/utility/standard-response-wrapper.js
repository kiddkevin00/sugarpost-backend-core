/*
 * Standard response format (for 200 status code only):
 * ```
 * {
 *   result: {
 *     meta: { name: "INSERT" },
 *     data: [ { } ]
 *   }
 * }
 * ```
 */

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

  get format() {
    return {
      meta: { name: this[responseContext].name },
      data: this[responseContext].data,
    };
  }

}

module.exports = exports = StandardResponseWrapper;
