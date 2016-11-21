const ConnectionPool = require('../storage/connection-pool');
const RepoFactory = require('../storage/repo-factory');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

class DatabaseService {

  static execute(state, strategy) {
    const dbHost = process.env.MONGODB_URI ?
      process.env.MONGODB_URI.split('@')[1].split(':')[0] : null;
    const dbPort = process.env.MONGODB_URI ?
      process.env.MONGODB_URI.split('@')[1].split(':')[1].split('/')[0] : null;
    const dbUser = process.env.MONGODB_URI ?
      process.env.MONGODB_URI.split('@')[0].split('://')[1].split(':')[0] : null;
    const dbPassword = process.env.MONGODB_URI ?
      process.env.MONGODB_URI.split('@')[0].split('://')[1].split(':')[1] : null;
    const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB, dbHost, dbPort, dbUser,
      dbPassword);
    const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);
    const tableName = strategy.tableName;
    const operation = strategy.operation;
    const uniqueFields = strategy.uniqueFields;

    return repo.select(conn, tableName)
      .then((docs) => {
        if (!Array.isArray(uniqueFields) || !uniqueFields.length) {
          return;
        }

        for (const doc of docs) {
          for (const field of uniqueFields) {
            if (state[field] === doc[field]) {
              const err = new StandardErrorWrapper([
                {
                  code: constants.SYSTEM.ERROR_CODES.TABLE_CONSTRAINT_VALIDATION,
                  name: constants.STORE.ERROR_NAMES.REQUIRED_FIELDS_NOT_UNIQUE,
                  source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
                  message: constants.STORE.ERROR_MSG.REQUIRED_FIELDS_NOT_UNIQUE,
                },
              ]);

              throw err;
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
