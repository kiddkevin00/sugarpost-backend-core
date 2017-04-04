const prodCredential = require('./production');
const testCredential = require('./test');
const devCredential = require('./development');

let credential;

if (process.env.NODE_ENV === 'production') {
  credential = prodCredential;
} else if (process.env.NODE_ENV === 'test') {
  credential = testCredential;
} else {
  credential = devCredential;
}

module.exports = exports = credential;
