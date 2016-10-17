const controllerModule = require('../../../lib/controllers/');

describe('Controller component', () => {

  it('exposes a sample controller class', () => {
    expect(controllerModule.SampleController).to.exist;
  });

});
