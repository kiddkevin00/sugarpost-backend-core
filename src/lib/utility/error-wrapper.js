class ErrorWrapper {

  constructor(err) {
    if (Array.isArray(err)) {
      this.errorStack = err;
    } else if (err) {
      this.errorStack = [{ message: err.toString() }];
    } else {
      this.errorStack = [];
    }
  }

  append(newError) {
    const errElement = (typeof newError !== 'string') ?
      newError : { message: newError.toString() };

    this.errorStack.unshift(errElement);
  }

  get format() {
    return {
      errors: this.errorStack,
    };
  }

  static getErrorObject(newError, originalError) {
    let standardizedError;

    if (originalError && originalError.append) {
      standardizedError = originalError;
    } else if (originalError) {
      standardizedError = new ErrorWrapper(originalError);
    } else {
      standardizedError = new ErrorWrapper();
    }

    standardizedError.append(newError);

    return standardizedError;
  }
}

module.exports = exports = ErrorWrapper;
