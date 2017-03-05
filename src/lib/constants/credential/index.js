const devCredential = require('./development');
const prodCredential = require('./production');

let credential;

if (process.env.NODE_ENV === 'production') {
  credential = prodCredential;
} else {
  credential = devCredential;
}

module.exports = exports = credential;
