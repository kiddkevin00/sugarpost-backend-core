/**
 * The web application begins here.
 */

const packageJson = require('../../package.json');
const configExpressServer = require('./config/express-server');
const routes = require('./routes/');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

configExpressServer(app);
routes(app);

server.listen(packageJson.config.port, packageJson.config.ip, () => {
  console.log('Express server listening on port: %d at IP: %s, in %s mode', packageJson.config.port,
    packageJson.config.ip, app.get('env')); // [Note] `app.get('env') === process.env.NODE_ENV`
});
