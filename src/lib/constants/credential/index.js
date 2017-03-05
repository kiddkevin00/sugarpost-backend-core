const prodCredential = require('./production');
const devCredential = require('./development');

let credential;

if (process.env.NODE_ENV === 'production') {
  credential = prodCredential;
} else {
  credential = devCredential;
}

module.exports = exports = credential;
