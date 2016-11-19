const MongoStore = require('./store/mongo-store');
const PostgresStore = require('./store/postgres-store');
const Validator = require('../utility/precondition-validator');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

const stores = {
  [MongoStore.STORE_TYPE]: MongoStore,
  [PostgresStore.STORE_TYPE]: PostgresStore,
};

/**
 * A factory to manufacture a repository, which implement basic and advanced store interface
 * for supported store type.
 */
class RepoFactory {

  static manufacture(storeType) {
    const repository = stores[storeType];

    if (repository) {
      RepoFactory._validateStoreInterface(repository);
    } else {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.STATUS_CODES.NOT_IMPLEMENTED,
          name: constants.STORE.ERROR_NAMES.NOT_IMPLEMENTED,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
        },
      ]);
      
      throw err;
    }

    return repository;
  }

  static _validateStoreInterface(repo) {
    Validator.shouldNotBeEmpty(repo.insert, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.select, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.update, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.delete, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.configIndex, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.upsert, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.dropTable, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED)
      .shouldNotBeEmpty(repo.dropDb, constants.STORE.ERROR_NAMES.INTERFACE_NOT_IMPLEMENTED);
  }

}

module.exports = exports = RepoFactory;
