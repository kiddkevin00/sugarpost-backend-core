const MongoStore = require('./store/mongo-store');
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
      if (!RepoFactory._isStoreInterfaceImplemented(repository)) {
        const err = new Error({
          errors: [
            {
              status: constants.SYSTEM.STATUS_CODES.NOT_IMPLEMENTED,
              code: constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
            },
          ],
        });

        throw err;
      }
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

  static _isStoreInterfaceImplemented(Store) {
    return !!(Store.insert && Store.select && Store.update && Store.delete && Store.configIndex &&
      Store.upsert && Store.resetTable && Store.resetDb);
  }

}

module.exports = exports = RepoFactory;
