const Store = require('../../../../lib/storage/store/base');

describe('High-level (base) store', () => {

  it('implements upsert functionality', () => {
    expect(Store).to.have.property('upsert').that.is.a('function');
  });

});
