const stateContext = Symbol('internalStateContext');

class ProcessState {

  constructor(options, { containerId, requestCount }) {
    this[stateContext] = {};

    this[stateContext].context = { containerId, requestCount };
    this[stateContext].email = options.email;
    this[stateContext].password = options.password;
    this[stateContext].firstName = options.firstName;
    this[stateContext].lastName = options.lastName;
  }

  get context() {
    return this[stateContext].context;
  }

  get email() {
    return this[stateContext].email;
  }

  get password() {
    return this[stateContext].password;
  }

  get firstName() {
    return this[stateContext].firstName;
  }

  get lastName() {
    return this[stateContext].lastName;
  }

  static create(options, context) {
    return new ProcessState(options, context);
  }

}

module.exports = exports = ProcessState;
