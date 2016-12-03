/*
 * Standard error format:
 *  ```
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
 *  ```
 */

class StandardErrorWrapper {

  constructor(initialErr) {
    if (Array.isArray(initialErr)) {
      /*
       * If initial error(s) is(are) wrapped into an array, each of them should follow standard
       * error format.
       */
      this.errorStack = initialErr;
    } else if (initialErr) {
      // An initial error doesn't follow standard error format, and will try to standardized it.
      const errMsg = initialErr.toString !== '[object Object]' ?
        initialErr.toString() : JSON.stringify(initialErr, null, 2);

      this.errorStack = [{ message: errMsg, detail: initialErr }];
    } else {
      // Without initial error.
      this.errorStack = [];
    }
  }

  append(newError) {
    let errElement;

    if (newError.toString !== '[object Object]') {
      errElement = { message: newError.toString(), detail: newError };
    } else {
      // If new error is an object, it should follow standard error format.
      errElement = newError;
    }

    this.errorStack.unshift(errElement);
  }

  format(context) {
    return {
      context,
      errors: this.errorStack,
    };
  }

}

module.exports = exports = StandardErrorWrapper;
