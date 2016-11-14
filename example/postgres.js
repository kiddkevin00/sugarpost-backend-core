const ConnectionPool = require('../src/lib/storage/connection-pool');
const RepoFactory = require('../src/lib/storage/repo-factory');
const constants = require('../src/lib/constants/');
const Chance = require('chance');
const Promise = require('bluebird');
const Sequelize = require('sequelize');

const conn = new ConnectionPool(constants.STORE.TYPES.POSTGRES, '127.0.0.1', 5432, 'bulletin-board-system');
const repo = RepoFactory.manufacture(constants.STORE.TYPES.POSTGRES);
const seedDataLength = 3;
const chance = new Chance();


// repo.on(conn, 'connect')
//   .then(() => {
//     console.log('Connection established successfully.');
//   });
// repo.on(conn, 'error')
//   .then(printErrorMsg);

Promise.try(() => {
  repo.createTable(conn,'Poppy',{
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    age: {
      type: Sequelize.INTEGER
    }
  })
})
.then(() => {
  const promises = [];


    for (let i = 0; i < seedDataLength; i++) {
      promises.push(
        repo.insert(conn, 'Poppy', {
          firstName: chance.first(),
          lastName: chance.last(),
          age: chance.age()
        })
      );
    }

    return Promise.all(promises)
})   
.then(() => repo.select(conn, 'Poppy', { age: { $gte: 21 } }))
.then(validateResult.bind(null, 'inserting'))
.then(() => repo.delete(conn, 'Poppy', { age: { $gte: 21 } }))
// .then(() => repo.select(conn, 'Poppy'))
// .then(validateResult.bind(null, 'deleting'))
// .then(() => repo.dropTable(conn, 'Poppy'))
// .then(() => repo.dropDb(conn))
.catch(printErrorMsg);

function validateResult(type, rows) {
  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
}

function printErrorMsg(err) {
  console.log(`Something breaks - ${JSON.stringify(err, null, 2)}.`);
}
