const ConnectionPool = require('../src/lib/storage/connection-pool');
const RepoFactory = require('../src/lib/storage/repo-factory');
const constants = require('../src/lib/constants/');
const Chance = require('chance');
const Promise = require('bluebird');

const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);
const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);
const seedDataLength = 3;
const chance = new Chance();

repo.on(conn, 'connect')
  .then(() => {
    console.log('Connection established successfully.');
  });
repo.on(conn, 'error')
  .then(printErrorMsg);

Promise.try(() => {
    const promises = [];

    for (let i = 0; i < seedDataLength; i++) {
      promises.push(
        repo.insert(conn, 'person', {
          firstName: chance.first(),
          lastName: chance.last(),
          age: chance.age(),
          underAge: chance.bool(),
        })
      );
    }

    return Promise.all(promises)
  })
  .then(() => repo.select(conn, 'person'))
  .then(validateResult.bind(null, 'inserting'))
  .then(() => repo.update(conn, 'person', { age: { $gte: 21 } }, { underAge: false }))
  .then(() => repo.update(conn, 'person', { age: { $lt: 21 } }, { underAge: true }))
  .then(() => repo.select(conn, 'person'))
  .then(validateResult.bind(null, 'updating'))
  .then(() => repo.delete(conn, 'person', { age: { $lt: 21 } }))
  .then(() => repo.select(conn, 'person'))
  .then(validateResult.bind(null, 'deleting'))
  .then(() => repo.dropTable(conn, 'person'))
  .then(() => repo.dropDb(conn))
  .catch(printErrorMsg);

function validateResult(type, rows) {
  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
}

function printErrorMsg(err) {
  console.log(`Something breaks - ${JSON.stringify(err, null, 2)}.`);
}