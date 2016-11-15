const ConnectionPool = require('../src/lib/storage/connection-pool');
const RepoFactory = require('../src/lib/storage/repo-factory');
const constants = require('../src/lib/constants/');
const Sequelize = require('sequelize');
const Chance = require('chance');
const Promise = require('bluebird');



const repo = RepoFactory.manufacture(constants.STORE.TYPES.POSTGRES);
const seedDataLength = 5;
const chance = new Chance();
let conn;


function validateResult(type, rows) {
  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
}

function printErrorMsg(err) {
  console.log(`Something breaks - ${JSON.stringify(err, null, 2)}.`);
}

repo.createDb('localhost', 5432, 'testing')
.then(() => {
  conn = new ConnectionPool(constants.STORE.TYPES.POSTGRES, 'localhost', 5432, 'testing');
})
.then(() => {
  const promisesTable = [];
  promisesTable.push(
    repo.createTable(conn, 'testing', {
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      age: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
    })
  );
  return Promise.all(promisesTable);
})
.then(() => {
  const promises = [];
  for (let i = 0; i < seedDataLength; i += 1) {
    promises.push(
      repo.insert(conn, 'testing', {
        firstName: chance.first(),
        lastName: chance.last(),
        age: chance.age(),
        status: 'pending',
      })
    );
  }
  return Promise.all(promises);
})
.then(() => repo.select(conn, 'testing', { age: { $gte: 50 } }))
.then(validateResult.bind(null, 'inserting'))
.then(() => repo.update(conn, 'testing', { age: { $gte: 50 } }, { status: 'pass' }))
.then(validateResult.bind(null, 'updating'))
.then(() => repo.delete(conn, 'testing', { age: { $lt: 50 } }))
.then(validateResult.bind(null, 'deleting'))
.then(() => repo.dropTable(conn, 'testing'))
.then(() => repo.dropDb(conn, 'localhost', 5432, 'testing'))
.catch(printErrorMsg);

