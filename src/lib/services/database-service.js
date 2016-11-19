const ConnectionPool = require('../storage/connection-pool');
const RepoFactory = require('../storage/repo-factory');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants/');

class DatabaseService {

  static execute(state, strategy) {
    const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);
    const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);
    const tableName = strategy.tableName;
    const operation = strategy.operation;
    const uniqueFields = strategy.uniqueFields;

    return repo.select(conn, tableName)
      .then((docs) => {
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
        repo[operation](conn, tableName, {
          email: state.email,
          password: state.password,
          firstName: state.firstName,
          lastName: state.lastName,
        });
      });
  }

}

module.exports = exports = DatabaseService;
