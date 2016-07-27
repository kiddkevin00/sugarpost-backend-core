const MongoStore = require('./mongo-store');
const Store = require('./store');
const constants = require('../constants/');

const LowLevelStores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

class RepoFactory {

  static manufacture(storeType) {
    const repository = Object.assign({}, RepoFactory._assignLowLevelOperations(storeType),
      RepoFactory._assignHighLevelOperations());

    RepoFactory._assignLowLevelOperations(storeType, repository);
    RepoFactory._assignHighLevelOperations(repository);

    return repository;
  }

  static _assignLowLevelOperations(storeType) {
    const LowLevelStore = LowLevelStores[storeType];

    if (LowLevelStore) {
      try {
        return {
          insert: LowLevelStore.insert,
          select: LowLevelStore.select,
          update: LowLevelStore.update,
          delete: LowLevelStore.delete,
          configIndex: LowLevelStore.configIndex,
        };
      } catch (err) {
        throw(new Error({
          errors: [
            {
              code: constants.store.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED,
              source: constants.common.COMMON.CURRENT_SOURCE,
              message: constants.store.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
              details: err,
            },
          ],
        }));
      }
    } else {
      throw new Error({
        errors: [
          {
            code: constants.store.ERROR_CODES.INVALID_STORAGE_TYPE,
            source: constants.common.COMMON.CURRENT_SOURCE,
            message: constants.store.ERROR_MSG.INVALID_STORAGE_TYPE,
          },
        ],
      });
    }
  }

  static _assignHighLevelOperations() {
    return {
      upsert: Store.upsert,
      resetCollection: Store.resetCollection,
      resetDb: Store.resetDb,
    };
  }

}

module.exports = exports = RepoFactory;
