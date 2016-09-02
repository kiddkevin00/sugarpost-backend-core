const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

function expressServer(app) {
  const env = app.get('env'); // Same as `process.env.NODE_ENV`.

  app.use(compression());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.json({
    type: 'application/vnd.api+json', // Parses application/vnd.api+json as json.
  }));

  app.use(methodOverride()); // Simulates DELETE and PUT if browser doesn't support.
  app.use(cookieParser());

  // [TODO] Use JWT instead of session
  app.use(session({
    secret: 'SESSION_SECRET', // [TODO]
    path: '/',
    httpOnly: false,
    secure: false, // HTTPS-enabled website required.
    maxAge: 1000 * 60 * 60 * 8, // [TBD] Set 8 Hours for now.
    resave: true, // Forces the session to be saved back to the session store.
    saveUninitialized: false,
  }));

  // [TODO]
  app.use(morgan('dev'));
  if (env === 'production') {

  } else {
    app.use(errorHandler()); // Error handler - has to be last
  }
}

module.exports = exports = expressServer;
