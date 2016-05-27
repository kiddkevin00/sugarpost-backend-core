var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var errorHandler = require('errorhandler');

function expressServer(app) {
  var env = app.get('env'); // same as `process.env.NODE_ENV`

  app.use(compression());

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parses application/vnd.api+json as json

  app.use(methodOverride()); // simulates DELETE and PUT if browser doesn't support
  app.use(cookieParser());

  // [TODO] Use JWT instead of session
  app.use(session({
    secret: 'SESSION_SECRET', // [TODO]
    path: '/',
    httpOnly: false,
    secure: false, // https-enabled website required
    maxAge: 1000 * 60 * 60 * 8, // [TBD] 8 Hours
    resave: true, // forces the session to be saved back to the session store
    saveUninitialized: false
  }));

  app.use(morgan('dev'));

  if (env === 'production') {

  } else {
    app.use(errorHandler()); // error handler - has to be last
  }
}

module.exports = exports = expressServer;
