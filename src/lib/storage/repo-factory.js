const MongoStore = require('./mongo-store');
const Store = require('./store');
const constants = require('../constants/');

const LowLevelStores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

/*
 * A factory to manufacture a repository which implement basic and advanced STORE interface
 * for supported STORE type
 */
class RepoFactory {

  static manufacture(storeType) {
    const repository = Object.assign({}, RepoFactory._assignLowLevelOperations(storeType),
      RepoFactory._assignHighLevelOperations());

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
              code: constants.STORE.ERROR_CODES.INTERFACE_NOT_IMPLEMENTED,
              source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
              message: constants.STORE.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED,
              details: err,
            },
          ],
        }));
      }
    } else {
      throw new Error({
        errors: [
          {
            code: constants.STORE.ERROR_CODES.INVALID_STORAGE_TYPE,
            source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
            message: constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE,
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
