/**
 * This class implements the advanced store interface, which only uses the  methods from the
 * defined base store interface.  It should only contain static members.
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
