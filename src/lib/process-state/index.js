const stateContext = Symbol('internalStateContext');

class ProcessState {

  constructor(options, { containerId, requestCount }) {
    this[stateContext] = {};

    this[stateContext].context = { containerId, requestCount };
    this[stateContext].sampleParam = options.sampleParam;

  }

  get context() {
    return this[stateContext].context;
  }

  get sampleParam() {
    return this[stateContext].sampleParam;
  }

  static create(options, context) {
    return new ProcessState(options, context);
  }

}

module.exports = exports = ProcessState;
