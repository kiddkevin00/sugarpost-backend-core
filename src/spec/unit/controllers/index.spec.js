const controllerModule = require('../../../lib/controllers/');

describe('Controller module', () => {
  it('exposes a sample controller class', () => {
    expect(controllerModule.SampleController).to.exist;
  });

});
