/* eslint-disable no-unused-vars */

const StandardErrorWrapper = require('../../utils/standard-error-wrapper');
const constants = require('../../constants/');

/**
 * This class defines the base store interface and implements the advanced ones, which only
 * uses the methods from the defined base store interface.  It should only contain static members.
 */
class BaseStore {

  static insert(connection, collectionName, newDoc) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static select(connection, collectionName, query = {}) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static update(connection, tableName, query, newFieldValue) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static delete(connection, tableName, query) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static configIndex(/*connection*/) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static dropTable(connection, tableName) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static dropDb(connection) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static close(connection) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static on(connection, event) {
    const err = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_IMPLEMENTED,
        name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
        message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
      },
    ]);

    throw err;
  }

  static upsert(connection, tableName, query, newRows) {
    return this.select(connection, tableName, query)
      .then((rows) => {
        if (rows.length) {
          return this.update(connection, tableName, query, newRows);
        }
        return this.insert(connection, tableName, newRows);
      });
  }

}

module.exports = exports = BaseStore;
