const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const fs = require('fs');
const path = require('path');
const express = require('express');

function setupExpressServer(app) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.json({
    type: 'application/vnd.api+json', // Parses "application/vnd.api+json" content-type as json.
  }));

  app.use(methodOverride()); // Simulates DELETE and PUT methods if browser doesn't support.
  app.use(cookieParser());

  app.use(compression());

  // [TODO] Uses JWT instead of session.
  app.use(session({
    secret: 'SESSION_SECRET',
    path: '/',
    httpOnly: false,
    secure: false, // HTTPS-enabled website required.
    maxAge: 1000 * 60 * 60 * 8, // [TBD] Set 8 Hours for now.
    resave: true, // Forces the session to be saved back to the session store.
    saveUninitialized: false,
  }));

  // For an 404 error page only.
  app.set('views', path.resolve(__dirname, '../views'));
  app.set('view engine', 'jade');

  const env = app.get('env'); // Same as `process.env.NODE_ENV`.

  if (env === 'production') {
    const accessLogStream = fs.createWriteStream(path.resolve(__dirname, '../../../morgan.log'),
      { flags: 'a' });

    app.use(morgan('combined', { stream: accessLogStream }));
  } else {
    // The Node environment should be either "test" or "development".
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be the last
  }

  return app;
}

module.exports = exports = setupExpressServer;
