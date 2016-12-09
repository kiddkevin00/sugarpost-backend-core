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

class StandardResponseWrapper {

  constructor(initialData, name) {
    if (Array.isArray(initialData)) {
      this.data = initialData;
    } else if (initialData) {
      this.data = [initialData]
    } else {
      this.data = [];
    }

    this.name = name;
  }

  append(newData) {
    this.data.push(newData);
  }

  get format() {
    return {
      meta: { name: this.name },
      data: this.data,
    };
  }

}

module.exports = exports = StandardResponseWrapper;
