const Store = require('../../../../lib/storage/store/base');

describe('High-level (base) store', () => {

  it('implement upsert functionality', () => {
    expect(Store).to.have.property('upsert').that.is.an('function');
  });

  it('implement resetting table functionality', () => {
    expect(Store).to.have.property('resetTable').that.is.an('function');
  });

  it('implement resetting DB functionality', () => {
    expect(Store).to.have.property('resetDb').that.is.an('function');
  });

});
