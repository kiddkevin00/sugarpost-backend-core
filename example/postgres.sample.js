const ConnectionPool = require('../src/lib/storage/connection-pool');
const RepoFactory = require('../src/lib/storage/repo-factory');
const constants = require('../src/lib/constants/');
const Sequelize = require('sequelize');
const Chance = require('chance');
const Promise = require('bluebird');

let conn;
const repo = RepoFactory.manufacture(constants.STORE.TYPES.POSTGRES);
const host = '127.0.0.1';
const port = 5432;
const dbName = 'testingDb';
const tableName = 'person';
const schema = {
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  age: {
    type: Sequelize.INTEGER,
  },
  underAge: {
    type: Sequelize.BOOLEAN,
  },
};
const seedDataLength = 5;
const chance = new Chance();

conn = new ConnectionPool(constants.STORE.TYPES.POSTGRES, host, port, dbName);

repo.createDb(host, port, dbName)
  .then(() => {
    conn = new ConnectionPool(constants.STORE.TYPES.POSTGRES, host, port, dbName);
  })
  .then(() => repo.createTable(conn, tableName, schema))
  .then(() => {
    const promises = [];

    for (let i = 0; i < seedDataLength; i += 1) {
      promises.push(
        repo.insert(conn, tableName, {
          firstName: chance.first(),
          lastName: chance.last(),
          age: chance.age(),
          underAge: chance.bool(),
        })
      );
    }

    return Promise.all(promises);
  })
  .then(() => repo.select(conn, tableName))
  .then(validateResult.bind(null, 'inserting'))
  .then(() => repo.update(conn, tableName, { age: { $gte: 21 } }, { underAge: false }))
  .then(() => repo.update(conn, tableName, { age: { $lt: 21 } }, { underAge: true }))
  .then(() => repo.select(conn, tableName))
  .then(validateResult.bind(null, 'updating'))
  .then(() => repo.delete(conn, tableName, { age: { $lt: 21 } }))
  .then(() => repo.select(conn, tableName))
  .then(validateResult.bind(null, 'deleting'))
  .then(() => repo.dropTable(conn, tableName))
  .then(() => repo.dropDb(conn, 'localhost', 5432, tableName))
  .catch(printErrorMsg);

function validateResult(type, rows) {
  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
}

function printErrorMsg(err) {
  console.log(`Something breaks - ${JSON.stringify(err, null, 2)}.`);
}
