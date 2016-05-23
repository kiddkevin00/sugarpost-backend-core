const MongoStore = require('./mongo-store');
const Store = require('./store');
const constants = require('../constants/')

const LowLevelStores = {
  [MongoStore.STORE_TYPE]: MongoStore,
};

class RepoFactory {

  static manufacture(storeType) {
    let repository = {};

    RepoFactory._assignLowLevelOperations(storeType, repository);
    RepoFactory._assignHighLevelOperations(repository);

    return repository;
  }

  static _assignLowLevelOperations(storeType, repository) {
    const Repo = LowLevelStores[storeType];

    if (Repo) {
      try {
        repository.insert = Repo.insert;
        repository.select = Repo.select;
        repository.update = Repo.update;
        repository.delete = Repo.delete;
        repository.configIndex = Repo.configIndex;
      } catch (e) {
        throw(new Error(constants.ERROR_MSG.INTERFACE_NOT_IMPLEMENTED));
      }
    } else {
      throw new Error(constants.STORE.ERROR_MSG.INVALID_STORAGE_TYPE);  
    }
  }

  static _assignHighLevelOperations(repository) {
    repository.upsert = Store.upsert.bind(repository);
    repository.resetCollection = Store.resetCollection.bind(repository);
    repository.resetDb = Store.resetDb.bind(repository);
  }

}

module.exports = exports = RepoFactory;
