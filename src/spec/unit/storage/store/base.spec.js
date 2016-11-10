const Store = require('../../../../lib/storage/store/base');

describe('High-level (base) store', () => {

  it('implements upsert functionality', () => {
    expect(Store).to.have.property('upsert').that.is.a('function');
  });

  it('implements resetting table functionality', () => {
    expect(Store).to.have.property('resetTable').that.is.a('function');
  });

  it('implements resetting DB functionality', () => {
    expect(Store).to.have.property('resetDb').that.is.a('function');
  });

});
