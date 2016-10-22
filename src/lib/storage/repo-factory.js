const MongoStore = require('./store/mongo-store');
const Validator = require('../utility/precondition-validator');
const constants = require('../constants/');

const stores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

/*
 * A factory to manufacture a repository, which implement basic and advanced store interface
 * for supported store type.
 */
class RepoFactory {

  static manufacture(storeType) {
    const repository = stores[storeType];

    if (repository) {
      RepoFactory._validateStoreInterface(repository);
    } else {
      const err = new Error({
        errors: [
          {
            status: constants.SYSTEM.STATUS_CODES.NOT_IMPLEMENTED,
            code: constants.STORE.ERROR_CODES.STORAGE_TYPE_NOT_FOUND,
            source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
            message: constants.STORE.ERROR_MSG.STORAGE_TYPE_NOT_FOUND,
          },
        ],
      });

      throw err;
    }

    return repository;
  }

  static _validateStoreInterface(Store) {
    Validator.shouldNotBeEmpty(Store.insert, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.select, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.update, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.delete, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.configIndex, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.upsert, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.resetTable, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(Store.resetDb, constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED);
  }

}

module.exports = exports = RepoFactory;
