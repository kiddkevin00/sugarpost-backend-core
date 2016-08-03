const Store = require('../../../lib/storage/store');

describe('High level STORE', () => {
  it('implement upsert functionality', () => {
    expect(Store).to.have.property('upsert').that.is.an('function');
  });

  it('implement resetCollection functionality', () => {
    expect(Store).to.have.property('resetCollection').that.is.an('function');
  });

  it('implement resetDb functionality', () => {
    expect(Store).to.have.property('resetDb').that.is.an('function');
  });
});
