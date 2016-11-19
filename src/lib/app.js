/**
 * The process of the web application begins here - non-cluster mode.
 */

const packageJson = require('../../package.json');
const setupExpressServer = require('./servers/express-server');
const setupRoutes = require('./routes/');
const express = require('express');
const http = require('http');

// Set default Node environment to "development".
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);

setupExpressServer(app);
setupRoutes(app);

const webServer = server.listen(packageJson.config.port, packageJson.config.ip, () => {
  // [TODO] Replace with logger module.
  console.log('Express server listening on port: %d at IP: %s, in %s mode',
    webServer.address().port,
    webServer.address().address, app.get('env'));
});

module.exports = exports = app;
