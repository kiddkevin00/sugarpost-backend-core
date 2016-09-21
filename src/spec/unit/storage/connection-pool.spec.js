const ConnectionPool = require('../../../lib/storage/connection-pool');
const constants = require('../../../lib/constants/index');

describe('Connection pool', () => {
  let connection;

  afterEach(() => {
    connection = null;
  });

  it('can initiate a new connection with supported store type', () => {
    connection = new ConnectionPool(constants.STORE.STORE_TYPES.MONGO_DB);

    expect(connection).to.exist;
  });

  it('throws an error when initiating a new connection with an unsupported STORE type', () => {
    expect(() => {
      connection = new ConnectionPool('unsupported-store');
    }).to.throw();
  });

});
