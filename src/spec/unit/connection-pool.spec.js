const constants = require('../../lib/constants/');
const ConnectionPool = require('../../lib/storage/connection-pool');
const Store = require('../../lib/storage/store');

var c = new ConnectionPool(constants.STORE.STORE_TYPES.MONGO_DB);
var s = Store.init(constants.STORE.STORE_TYPES.MONGO_DB);

s.select(c, 'bars', {})
  .then((d) => {
    console.log(d);

    c.close();
  });

describe('test', function() {
  it('has a dummy spec', function() {
    expect(true).toBe(true);

  });

  it('has another dummy spec', function() {
    expect(true).toBe(true);

  });
})

