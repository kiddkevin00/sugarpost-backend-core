const ConnectionPool = require('../../../lib/storage/connection-pool');
const constants = require('../../../lib/constants/index');

describe('Connection pool', () => {
  let connection;

  it('can initiate a new connection with supported store type', () => {
    connection = new ConnectionPool(constants.store.STORE_TYPES.MONGO_DB);

    expect(connection).to.exist;
  });

  it('throws an error when initiating a new connection with an unsupported store type', () => {
    expect(() => {
      connection = new ConnectionPool('unsupported-store');
    }).to.throw();
  });

});
