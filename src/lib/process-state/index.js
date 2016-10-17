const internalState = Symbol('internal-state');

class ProcessState {

  constructor(options, { containerId, requestCount }) {
    this[internalState] = { containerId, requestCount };

    this[internalState] = options.sampleParam;

  }

  get context() {
    return this[internalState].context;
  }

  get requestCount() {
    return this[internalState].requestCount;
  }

  get sampleParam() {
    return this[internalState].sampleParam;
  }

  static create(options, context) {
    return new ProcessState(options, context);
  }

}

module.exports = exports = ProcessState;
