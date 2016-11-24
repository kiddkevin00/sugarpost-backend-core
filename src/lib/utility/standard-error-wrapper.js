/*
 * Standard error format:
 *  {
 *    errors: [
 *      {
 *        code: 404,
 *        source: 'current-app',
 *        name: 'SOMETHING_NOT_FOUND', // optional
 *        message: 'Something is not found.', // optional
 *        detail: `err` // optional
 *      }
 *    ]
 *  }
 */

class StandardErrorWrapper {

  constructor(err) {
    if (Array.isArray(err)) {
      this.errorStack = err;
    } else if (err) {
      const errMsg = err.toString !== '[object Object]' ?
        err.toString() : JSON.stringify(err, null, 2);

      this.errorStack = [{ message: errMsg }];
    } else {
      this.errorStack = [];
    }
  }

  append(newError) {
    const errElement = (newError instanceof Error) ?
      { message: newError.toString() } : newError;

    this.errorStack.unshift(errElement);
  }

  format(context) {
    return {
      context,
      errors: this.errorStack,
    };
  }

  static standardizeError(newError, originalError) {
    let standardizedError;

    if (originalError && originalError.append) {
      standardizedError = originalError;
    } else if (originalError) {
      standardizedError = new StandardErrorWrapper(originalError);
    } else {
      standardizedError = new StandardErrorWrapper();
    }

    standardizedError.append(newError);

    return standardizedError;
  }
}

module.exports = exports = StandardErrorWrapper;
