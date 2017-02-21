const stateContext = Symbol('process-state-context');

class ProcessState {

  constructor(options, { containerId, requestCount }) {
    this[stateContext] = {};

    this[stateContext].context = { containerId, requestCount };
    this[stateContext].email = options.email;
    this[stateContext].password = options.password;
    this[stateContext].fullName = options.fullName;
    this[stateContext].referCode = options.referCode;
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

  get fullName() {
    return this[stateContext].fullName;
  }

  get lastName() {
    return this[stateContext].lastName;
  }

  get referCode() {
    return this[stateContext].referCode;
  }

  static create(options, context) {
    return new ProcessState(options, context);
  }

}

module.exports = exports = ProcessState;
