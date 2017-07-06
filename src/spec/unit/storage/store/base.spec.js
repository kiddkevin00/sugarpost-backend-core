const BaseStore = require('../../../../lib/storage/stores/base');


describe('Base (high-level) store', function () {

  it('implements upsert functionality :: upsert()', function () {
    expect(BaseStore).to.have.property('upsert').that.is.a('function');
  });

});
