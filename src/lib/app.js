/**
 * The process of the web application begins here.
 */

const packageJson = require('../../package.json');
const configExpressServer = require('./config/express-server');
const configRoutes = require('./routes/');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

configExpressServer(app);
configRoutes(app);

const webServer = server.listen(packageJson.config.port, packageJson.config.ip, () => {
  console.log('Express server listening on port: %d at IP: %s, in %s mode', webServer.address().port,
    webServer.address().address, app.get('env')); // [Note] `app.get('env') === process.env.NODE_ENV`
});
