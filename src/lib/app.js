/**
 * The process of the web application begins here.
 */

// Set default Node environment to "development".
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const packageJson = require('../../package.json');
const setupExpressServer = require('./server/express-server');
const setupRoutes = require('./routes/');
const express = require('express');
const http = require('http');

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
