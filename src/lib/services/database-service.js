const ConnectionPool = require('../storage/connection-pool');
const RepoFactory = require('../storage/repo-factory');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

class DatabaseService {

  static execute(state, strategy) {
    let connUri;
    const storeType = strategy.storeType;
    const tableName = strategy.tableName;
    const operation = strategy.operation;
    const uniqueFields = strategy.uniqueFields;
    const notFoundErr = new StandardErrorWrapper([
      {
        code: constants.SYSTEM.ERROR_CODES.NOT_FOUND,
        name: constants.STORE.ERROR_NAMES.STORAGE_TYPE_NOT_FOUND,
        message: constants.STORE.ERROR_MSG.STORAGE_TYPE_NOT_FOUND,
        source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
      },
    ]);

    switch (storeType) {
      case constants.STORE.TYPES.MONGO_DB:
        connUri = process.env.MONGODB_URI;
        break;
      case constants.STORE.TYPES.POSTGRES:
        connUri = process.env.DATABASE_URL;
        break;
      default:
        throw notFoundErr;
    }

    const dbHost = connUri ? connUri.split('@')[1].split(':')[0] : null;
    const dbPort = connUri ? connUri.split('@')[1].split(':')[1].split('/')[0] : null;
    const dbUser = connUri ? connUri.split('@')[0].split('://')[1].split(':')[0] : null;
    const dbName = connUri ? connUri.split('://')[1].split('/')[1] : null;
    const dbPassword = connUri ? connUri.split('@')[0].split('://')[1].split(':')[1] : null;

    const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB, dbHost, dbPort, dbName,
      dbUser, dbPassword);
    const repo = RepoFactory.manufacture(storeType);

    return repo.select(conn, tableName)
      .then((docs) => {
        if (!Array.isArray(uniqueFields) || !uniqueFields.length) {
          return;
        }

        for (const doc of docs) {
          for (const field of uniqueFields) {
            if (state[field] === doc[field]) {
              const validationErr = new StandardErrorWrapper([
                {
                  code: constants.SYSTEM.ERROR_CODES.TABLE_CONSTRAINT_VALIDATION,
                  name: constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE,
                  source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
                  message: constants.STORE.ERROR_MSG.REQUIRED_FIELDS_NOT_UNIQUE,
                },
              ]);

              throw validationErr;
            }
          }
        }
      })
      .then(() => {
        const operationType = operation.type;
        const operationData = operation.data;

        return repo[operationType](conn, tableName, ...operationData);
      });
  }

}

module.exports = exports = DatabaseService;
