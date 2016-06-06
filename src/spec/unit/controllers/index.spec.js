const controllerModule = require('../../../lib/controllers/');

describe('Controller modeul', () => {
  it('exposes sample controller', () => {
    expect(controllerModule.SampleController).to.exist; 
  });
  
});
