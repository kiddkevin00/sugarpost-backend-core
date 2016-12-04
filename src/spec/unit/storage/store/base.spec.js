const BaseStore = require('../../../../lib/storage/store/base');

describe('High-level (base) store', function () {

  it('implements upsert functionality :: upsert()', function () {
    expect(BaseStore).to.have.property('upsert').that.is.a('function');
  });

});
