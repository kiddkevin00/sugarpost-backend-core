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
  const promisesTable = [];
  promisesTable.push(
    repo.createTable(conn,'Poppy',{
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      }
    })
  );
  promisesTable.push(
    repo.createTable(conn,'Person',{
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      }
    })
  );
  return Promise.all(promisesTable);
})
.then(() => conn.sync({force:true}))
.then(() => {
  const promises = [];


    for (let i = 0; i < seedDataLength; i++) {
      promises.push(
        repo.insert(conn, 'Poppy', {
          firstName: chance.first(),
          lastName: chance.last(),
          age: chance.age(),
          status: 'pending'
        })
      );
    }

    return Promise.all(promises)
})   
.then(() => repo.select(conn, 'Poppy', { age: { $gte: 50 } }))
.then(validateResult.bind(null, 'inserting'))
.then(() => repo.update(conn, 'Poppy', { age: { $gte: 50 } } ,{status: 'pass'}))
.then(() => repo.delete(conn, 'Poppy', { age: { $lt: 50 } }))
.then(() => repo.dropTable(conn, 'Poppy'))
.catch(printErrorMsg);

function validateResult(type, rows) {
  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
}

function printErrorMsg(err) {
  console.log(`Something breaks - ${JSON.stringify(err, null, 2)}.`);
}
