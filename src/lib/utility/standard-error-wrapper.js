/*
 * Standard error format:
 *  ```
 *  {
 *    errors: [
 *      {
 *        code: 500,
 *        name: 'SOMETHING_WENT_WRONG', // optional
 *        source: 'current-app',
 *        message: 'Something went wrong.', // optional
 *        detail: `err` // optional
 *      },
 *      {
 *        code: 404,
 *        name: 'SOMETHING_NOT_FOUND', // optional
 *        source: 'another-app',
 *        message: 'Something is not found.', // optional
 *        detail: `err` // optional
 *      }
 *    ]
 *  }
 *  ```
 */

// [TODO] If throws an object with `Symbol('error-context')` property, the object will be `{}`.
const errorContext = 'error-context';

class StandardErrorWrapper {

  constructor(initialErr) {
    this[errorContext] = {};

    if (Array.isArray(initialErr)) {
      /*
       * If initial error(s) is(are) wrapped into an array, each of them should follow standard
       * error format.
       */
      this[errorContext].errorStack = initialErr;
    } else if (initialErr) {
      // An initial error doesn't follow standard error format, and will try to standardized it.
      const errMsg = initialErr.toString() !== '[object Object]' ?
        initialErr.toString() : JSON.stringify(initialErr, null, 2);

      this[errorContext].errorStack = [{ message: errMsg, detail: initialErr }];
    } else {
      // Without initial error.
      this[errorContext].errorStack = [];
    }
  }

  append(newError) {
    let errElement;

    if (newError.toString() !== '[object Object]') {
      errElement = { message: newError.toString(), detail: newError };
    } else {
      // If new error is an object, it should follow standard error format.
      errElement = newError;
    }

    this[errorContext].errorStack.unshift(errElement);
  }

  getNthError(nth) {
    return this[errorContext].errorStack[nth];
  }

  format(context = {}) {
    return {
      context,
      errors: this[errorContext].errorStack,
    };
  }

  // [TODO] Verify if `obj` follows standard error format.
  static verifyFormat(obj) {

  }

}

module.exports = exports = StandardErrorWrapper;
