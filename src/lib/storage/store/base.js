/*
 * This class should only contains static members.
 */
class BaseStore {

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
