const stateContext = Symbol('process-state-context');

class ProcessState {

  constructor(options, { containerId, requestCount }) {
    this[stateContext] = {};

    this[stateContext].context = { containerId, requestCount };
    this[stateContext]._id = options._id;
    this[stateContext].email = options.email;
    this[stateContext].password = options.password;
    this[stateContext].newPassword = options.newPassword;
    this[stateContext].fullName = options.fullName;
    this[stateContext].referralCode = options.referralCode;
    this[stateContext].source = options.source;
    this[stateContext].stripeSubscriptionId = options.stripeSubscriptionId;
  }

  get context() {
    return this[stateContext].context;
  }

  get _id() {
    return this[stateContext]._id;
  }

  get email() {
    return this[stateContext].email;
  }

  get password() {
    return this[stateContext].password;
  }

  get newPassword() {
    return this[stateContext].newPassword;
  }

  get fullName() {
    return this[stateContext].fullName;
  }

  get referralCode() {
    return this[stateContext].referralCode;
  }

  get source() {
    return this[stateContext].source;
  }

  get stripeSubscriptionId() {
    return this[stateContext].stripeSubscriptionId;
  }

  static create(options, context) {
    return new ProcessState(options, context);
  }

}

module.exports = exports = ProcessState;
